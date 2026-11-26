/**
 * MDMS Phase 1 - db.json generator
 *
 * Run:  npm run db:generate
 *
 * Writes ./db.json (project root) with realistic, internally consistent data.
 * The random generator is seeded, so everyone on the team who runs this on the
 * same day gets the same data. Commit db.json once and share it; do not let
 * every teammate regenerate and commit their own copy.
 *
 * Rules enforced by validate() at the bottom:
 *   - a meter has exactly one owner and exactly one zone
 *   - a meter's zone is always its owner's zone (never under two zones)
 *   - some customers own more than one meter
 *   - every customer has 12+ monthly bills (mix of paid / pending / overdue)
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fakerEN_IN as faker } from '@faker-js/faker'

faker.seed(2026)

const OUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'db.json')

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
const int = (min, max) => faker.number.int({ min, max })
const rand = () => int(0, 1_000_000) / 1_000_000
const between = (min, max) => min + (max - min) * rand()
const chance = (p) => rand() < p
const pick = (list) => faker.helpers.arrayElement(list)
const round1 = (n) => Math.round(n * 10) / 10
const round2 = (n) => Math.round(n * 100) / 100
const pad = (n, width = 2) => String(n).padStart(width, '0')
const sum = (list) => list.reduce((a, b) => a + b, 0)

/* ------------------------------------------------------------------ */
/* Calendar (everything in UTC, day 0 = first day of the oldest month)  */
/* ------------------------------------------------------------------ */
const DAY_MS = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const nowReal = new Date()
const TODAY = Date.UTC(nowReal.getUTCFullYear(), nowReal.getUTCMonth(), nowReal.getUTCDate())

const monthIdxOf = (ms) => {
  const d = new Date(ms)
  return d.getUTCFullYear() * 12 + d.getUTCMonth()
}
const monthStart = (idx) => Date.UTC(Math.floor(idx / 12), idx % 12, 1)
const daysIn = (idx) => (monthStart(idx + 1) - monthStart(idx)) / DAY_MS

const CUR_IDX = monthIdxOf(TODAY) // index of the current month
const HISTORY_MONTHS = 24
const ORIGIN = monthStart(CUR_IDX - HISTORY_MONTHS)

const dayIdxOf = (ms) => Math.round((ms - ORIGIN) / DAY_MS)
const dayMs = (i) => ORIGIN + i * DAY_MS
const LAST_DAY = dayIdxOf(TODAY) - 1 // yesterday

const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10)
const isoTime = (ms) => new Date(ms).toISOString()
const addDays = (ms, n) => ms + n * DAY_MS
const monthKey = (idx) => `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`
const monthShort = (idx) => `${MONTHS[idx % 12]} ${String(Math.floor(idx / 12)).slice(2)}`

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */
const ZONE_DEFS = [
  { id: 'Z01', name: 'Pune Central', location: 'Pune, Maharashtra', pincode: '411001', description: 'Central Pune: residential colonies and the old market area.', status: 'active' },
  { id: 'Z02', name: 'Mumbai Western', location: 'Mumbai, Maharashtra', pincode: '400050', description: 'Western suburbs from Bandra to Andheri.', status: 'active' },
  { id: 'Z03', name: 'Bengaluru South', location: 'Bengaluru, Karnataka', pincode: '560034', description: 'Koramangala, HSR Layout and surrounding neighbourhoods.', status: 'active' },
  { id: 'Z04', name: 'Hyderabad East', location: 'Hyderabad, Telangana', pincode: '500081', description: 'Hi-tech city side with many commercial connections.', status: 'active' },
  { id: 'Z05', name: 'Chennai North', location: 'Chennai, Tamil Nadu', pincode: '600001', description: 'Currently switched off while the network is upgraded.', status: 'deactivated' },
]

const STREETS = ['MG Road', 'Park Street', 'Gandhi Nagar', 'Residency Road', 'Lake View Road', 'Station Road', 'Nehru Colony', 'Temple Street', 'Market Road', 'Green Park']

const BASE_KWH = { residential: [7, 13], commercial: [28, 55], industrial: [120, 260] } // per day
const RATE = { residential: 6.5, commercial: 9.2, industrial: 7.8 } // rupees per kWh
const FIXED_CHARGE = { residential: 120, commercial: 450, industrial: 1500 } // rupees per month
const SEASON = [0.9, 0.9, 1.05, 1.25, 1.4, 1.3, 1.1, 1.1, 1.1, 1.0, 0.9, 0.95] // by month (Jan..Dec)
const HOUR_PROFILE = [0.025, 0.02, 0.018, 0.018, 0.02, 0.028, 0.045, 0.06, 0.055, 0.045, 0.04, 0.04, 0.042, 0.04, 0.038, 0.04, 0.05, 0.065, 0.08, 0.085, 0.075, 0.06, 0.045, 0.03]

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */
let personSeq = 0
function person() {
  personSeq += 1
  const first = faker.person.firstName()
  const last = faker.person.lastName()
  const slug = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '')
  const digits = pick(['6', '7', '8', '9']) + Array.from({ length: 9 }, () => int(0, 9)).join('')
  return {
    name: `${first} ${last}`,
    email: `${slug}${personSeq}@example.com`,
    phone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
  }
}

const newUser = (id, role, zoneId, status, joinedIdx) => ({
  id,
  role, // 'enterprise_admin' | 'zone_admin' | 'consumer'
  zoneId, // null for enterprise admins
  ...person(),
  status, // 'active' | 'deactivated'
  joinedOn: isoDate(monthStart(joinedIdx)),
  meterCount: 0, // filled in below (denormalised so tables can show it)
  notificationPrefs: { email: true, sms: chance(0.4) },
})

const users = []
const zones = []

// Enterprise admins (not tied to a zone)
users.push(newUser('U-E01', 'enterprise_admin', null, 'active', CUR_IDX - 24))
users.push(newUser('U-E02', 'enterprise_admin', null, 'active', CUR_IDX - 20))

// One admin per zone
ZONE_DEFS.forEach((def, i) => {
  const admin = newUser(`U-A${pad(i + 1)}`, 'zone_admin', def.id, def.status === 'active' ? 'active' : 'deactivated', CUR_IDX - int(14, 24))
  users.push(admin)
  zones.push({
    id: def.id,
    name: def.name,
    location: def.location,
    pincode: def.pincode,
    description: def.description,
    adminId: admin.id,
    status: def.status,
  })
})

/* ------------------------------------------------------------------ */
/* Meters + simulated daily consumption                                */
/* ------------------------------------------------------------------ */
const DEMO_CONSUMER_ID = 'U-C001'
const meters = []
const meterMeta = new Map() // meterId -> { startIdx, endIdx, running, featured }
const sim = new Map() // meterId -> { values, cum, startDay, endDay }
const featuredMeterIds = new Set() // these get full daily + hourly detail

function simulateMeter(tariff, startIdx, endIdx, running) {
  const values = new Array(LAST_DAY + 1).fill(0)
  const cum = new Array(LAST_DAY + 1).fill(0)
  const startDay = dayIdxOf(monthStart(startIdx))
  const endDay = running ? LAST_DAY : Math.min(LAST_DAY, dayIdxOf(monthStart(endIdx + 1)) - 1)
  const [lo, hi] = BASE_KWH[tariff]
  const base = between(lo, hi) * between(0.8, 1.25)
  let reading = 0
  for (let d = startDay; d <= endDay; d += 1) {
    const date = new Date(dayMs(d))
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6
    const dayFactor = tariff === 'residential' ? (weekend ? 1.12 : 1) : weekend ? 0.7 : 1
    const v = round1(base * SEASON[date.getUTCMonth()] * dayFactor * between(0.78, 1.22))
    values[d] = v
    reading = round1(reading + v)
    cum[d] = reading
  }
  return { values, cum, startDay, endDay }
}

let consumerSeq = 0
let meterSeq = 1000

for (const zone of zones) {
  const zoneActive = zone.status === 'active'
  const consumerCount = int(12, 15)

  for (let c = 0; c < consumerCount; c += 1) {
    consumerSeq += 1
    const isDemo = consumerSeq === 1
    const firstInZone = c === 0
    const joinedIdx = CUR_IDX - (isDemo ? 18 : int(13, 23)) // 13+ months => at least 12 bills

    const status = !zoneActive ? 'deactivated' : isDemo || firstInZone ? 'active' : chance(0.1) ? 'deactivated' : 'active'
    const user = newUser(`U-C${pad(consumerSeq, 3)}`, 'consumer', zone.id, status, joinedIdx)
    users.push(user)

    const meterCount = isDemo ? 1 : chance(0.03) ? 3 : chance(0.27) ? 2 : 1
    user.meterCount = meterCount

    for (let k = 0; k < meterCount; k += 1) {
      meterSeq += 1
      const id = `MTR-${meterSeq}`
      const startIdx = k === 0 ? joinedIdx : Math.min(joinedIdx + int(1, 8), CUR_IDX - 2)
      const tariff = isDemo ? 'residential' : chance(0.07) ? 'industrial' : chance(0.2) ? 'commercial' : 'residential'
      const featured = zoneActive && firstInZone && k === 0
      const running = zoneActive && status === 'active' && (isDemo || featured || !chance(0.08))
      // A switched-off meter stops being billed 1-4 months ago, but a customer's
      // first meter always keeps at least 12 months of billing history.
      const minEnd = k === 0 ? startIdx + 11 : startIdx
      const endIdx = running ? CUR_IDX - 1 : Math.min(CUR_IDX - 1, Math.max(minEnd, CUR_IDX - 1 - int(1, 4)))

      const s = simulateMeter(tariff, startIdx, endIdx, running)
      sim.set(id, s)
      meterMeta.set(id, { startIdx, endIdx, running, featured })
      if (featured) featuredMeterIds.add(id)

      meters.push({
        id,
        ownerId: user.id,
        ownerName: user.name, // denormalised so the meter table can search and sort by owner
        zoneId: zone.id,
        address: `${int(1, 240)}, ${pick(STREETS)}, ${zone.location.split(',')[0]} ${zone.pincode}`,
        status: running ? 'active' : 'deactivated',
        tariffCategory: tariff,
        installedOn: isoDate(monthStart(startIdx)),
        lastReading: s.cum[s.endDay],
        lastReadingAt: running
          ? isoTime(Math.min(nowReal.getTime(), TODAY + int(5, 300) * 60_000))
          : isoTime(dayMs(s.endDay + 1)),
      })
    }
  }
}

const demoUser = users.find((u) => u.id === DEMO_CONSUMER_ID)
const demoMeter = meters.find((m) => m.ownerId === DEMO_CONSUMER_ID)
const metersOf = (predicate) => meters.filter(predicate).map((m) => m.id)

/* ------------------------------------------------------------------ */
/* Bills + daily bill rows                                             */
/* ------------------------------------------------------------------ */
const bills = []
const billDays = []

for (const meter of meters) {
  const meta = meterMeta.get(meter.id)
  const s = sim.get(meter.id)
  const rate = RATE[meter.tariffCategory]
  const fixedCharge = FIXED_CHARGE[meter.tariffCategory]
  const isDemoMeter = meter.id === demoMeter.id

  for (let mi = meta.startIdx; mi <= meta.endIdx; mi += 1) {
    const from = dayIdxOf(monthStart(mi))
    const to = dayIdxOf(monthStart(mi + 1)) - 1
    const units = round1(sum(s.values.slice(from, to + 1)))
    const energyCharge = round2(units * rate)
    const amount = round2(energyCharge + fixedCharge)

    const ageMonths = CUR_IDX - 1 - mi // 0 = bill generated on the 1st of this month
    const issuedMs = monthStart(mi + 1) // all bills are generated on the 1st
    let dueMs = addDays(issuedMs, 15)
    let status
    let paidMs = null

    let paid
    if (isDemoMeter) {
      paid = ageMonths !== 0 && ageMonths !== 4 // demo customer: latest pending, one old overdue
    } else {
      paid = chance(ageMonths === 0 ? 0.5 : ageMonths === 1 ? 0.88 : 0.95)
    }

    if (paid) {
      status = 'paid'
      paidMs = Math.min(addDays(issuedMs, int(1, 14)), addDays(TODAY, -1))
    } else if (ageMonths === 0 && (isDemoMeter || chance(0.55))) {
      status = 'pending' // still inside the payment window
      dueMs = addDays(TODAY, int(3, 12))
    } else {
      status = dueMs < TODAY ? 'overdue' : 'pending'
    }

    const bill = {
      id: `INV-${monthKey(mi).replace('-', '')}-${meter.id.slice(4)}`,
      userId: meter.ownerId,
      meterId: meter.id,
      zoneId: meter.zoneId,
      month: monthKey(mi),
      units,
      energyCharge,
      fixedCharge,
      amount,
      issuedOn: isoDate(issuedMs),
      dueDate: isoDate(dueMs),
      status, // 'paid' | 'pending' | 'overdue'
      paidOn: paidMs ? isoDate(paidMs) : null,
    }
    bills.push(bill)

    // Day-by-day rows only for the featured meters (keeps db.json small)
    if (featuredMeterIds.has(meter.id)) {
      for (let d = from; d <= to; d += 1) {
        billDays.push({
          id: `${bill.id}-${pad(d - from + 1)}`,
          billId: bill.id,
          date: isoDate(dayMs(d)),
          reading: s.cum[d],
          consumption: s.values[d],
          cost: round2(s.values[d] * rate),
        })
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Daily readings (last 62 days) + hourly readings (last 7 days)       */
/* ------------------------------------------------------------------ */
function splitIntoHours(total) {
  const weights = HOUR_PROFILE.map((w) => w * between(0.85, 1.15))
  const weightSum = sum(weights)
  const hours = weights.map((w) => round1((total * w) / weightSum))
  const rest = round1(total - sum(hours.slice(0, 23)))
  hours[23] = Math.max(0, rest)
  return hours
}

const readings = []
const hourlyReadings = []

for (const meter of meters) {
  const s = sim.get(meter.id)
  const first = Math.max(s.startDay, LAST_DAY - 61)
  const active = s.values.slice(s.startDay, s.endDay + 1)
  const avg = active.length ? sum(active) / active.length : 0

  for (let d = first; d <= s.endDay; d += 1) {
    const high = s.values[d] > avg * 1.3
    readings.push({
      id: `${meter.id}-${isoDate(dayMs(d))}`,
      meterId: meter.id,
      date: isoDate(dayMs(d)),
      reading: s.cum[d],
      consumption: s.values[d],
      note: high ? 'High consumption' : chance(0.03) ? 'Estimated reading' : '',
    })
  }

  if (featuredMeterIds.has(meter.id)) {
    for (let d = LAST_DAY - 6; d <= LAST_DAY; d += 1) {
      const hours = splitIntoHours(s.values[d])
      let running = s.cum[d - 1] ?? 0
      hours.forEach((kwh, h) => {
        running = round1(running + kwh)
        hourlyReadings.push({
          id: `${meter.id}-${isoDate(dayMs(d))}T${pad(h)}`,
          meterId: meter.id,
          date: isoDate(dayMs(d)),
          hour: h,
          reading: running,
          consumption: kwh,
        })
      })
    }
  }
}

/* ------------------------------------------------------------------ */
/* Chart series: customer, zone and enterprise                         */
/* ------------------------------------------------------------------ */
const monthBuckets = (n) =>
  Array.from({ length: n }, (_, i) => {
    const idx = CUR_IDX - (n - i)
    return { label: monthShort(idx), from: dayIdxOf(monthStart(idx)), to: dayIdxOf(monthStart(idx + 1)) - 1 }
  })

const weekBuckets = (n) =>
  Array.from({ length: n }, (_, i) => {
    const to = LAST_DAY - (n - 1 - i) * 7
    return { label: `Week ${i + 1}`, from: to - 6, to }
  })

function buildSeries(scope, scopeId, meterIds) {
  const dayTotal = (d) => sum(meterIds.map((id) => sim.get(id).values[d] ?? 0))
  const rangeTotal = (from, to) => {
    let t = 0
    for (let d = from; d <= to; d += 1) t += dayTotal(d)
    return round1(t)
  }
  const make = (range, periodLabel, points) => ({
    id: `${scope}-${scopeId}-${range}`,
    scope, // 'user' | 'zone' | 'enterprise'
    scopeId,
    range, // 'day' | 'week' | 'month' | 'year'
    periodLabel,
    unit: 'kWh',
    points,
  })

  // Day: yesterday, per hour (midnight to midnight)
  const hours = splitIntoHours(dayTotal(LAST_DAY))
  const day = make('day', 'Yesterday', hours.map((value, h) => ({ label: `${pad(h)}:00`, value })))

  // Week: last 7 days, per day
  const week = make('week', 'Last 7 days', Array.from({ length: 7 }, (_, i) => {
    const d = LAST_DAY - 6 + i
    return { label: WEEKDAYS[new Date(dayMs(d)).getUTCDay()], value: round1(dayTotal(d)) }
  }))

  // Month: last full month, Week 1 .. Week 5
  const lastMonth = CUR_IDX - 1
  const start = dayIdxOf(monthStart(lastMonth))
  const length = daysIn(lastMonth)
  const weekCount = Math.ceil(length / 7)
  const month = make('month', `${MONTHS_LONG[lastMonth % 12]} ${Math.floor(lastMonth / 12)}`, Array.from({ length: weekCount }, (_, w) => ({
    label: `Week ${w + 1}`,
    value: rangeTotal(start + w * 7, Math.min(start + w * 7 + 6, start + length - 1)),
  })))

  // Year: last 12 full months
  const year = make('year', 'Last 12 months', monthBuckets(12).map((b) => ({ label: b.label, value: rangeTotal(b.from, b.to) })))

  return [day, week, month, year]
}

const consumptionSeries = []
for (const u of users.filter((x) => x.role === 'consumer')) {
  consumptionSeries.push(...buildSeries('user', u.id, metersOf((m) => m.ownerId === u.id)))
}
for (const z of zones) {
  consumptionSeries.push(...buildSeries('zone', z.id, metersOf((m) => m.zoneId === z.id)))
}
consumptionSeries.push(...buildSeries('enterprise', 'ALL', meters.map((m) => m.id)))

// Zone comparison (grouped bar chart): one document per zone and period
const zoneComparison = []
const PERIODS = { '4w': weekBuckets(4), '6m': monthBuckets(6), '12m': monthBuckets(12) }
for (const z of zones) {
  const ids = metersOf((m) => m.zoneId === z.id)
  for (const [period, buckets] of Object.entries(PERIODS)) {
    zoneComparison.push({
      id: `${z.id}-${period}`,
      zoneId: z.id,
      period, // '4w' | '6m' | '12m'
      points: buckets.map((b) => {
        let t = 0
        for (let d = b.from; d <= b.to; d += 1) t += sum(ids.map((id) => sim.get(id).values[d] ?? 0))
        return { label: b.label, value: round1(t) }
      }),
    })
  }
}

// One summary row per zone (cards, "total meters" column, bar chart)
const lastMonthBucket = monthBuckets(1)[0]
const zoneSummaries = zones.map((z) => {
  const zm = meters.filter((m) => m.zoneId === z.id)
  const perMeter = zm.map((m) => {
    let t = 0
    for (let d = lastMonthBucket.from; d <= lastMonthBucket.to; d += 1) t += sim.get(m.id).values[d] ?? 0
    return t
  })
  const reporting = perMeter.filter((t) => t > 0).length || 1
  return {
    id: z.id,
    zoneId: z.id,
    totalMeters: zm.length,
    activeMeters: zm.filter((m) => m.status === 'active').length,
    totalConsumers: users.filter((u) => u.role === 'consumer' && u.zoneId === z.id).length,
    lastMonthKwh: round1(sum(perMeter)),
    avgKwhPerMeter: round1(sum(perMeter) / reporting),
  }
})

/* ------------------------------------------------------------------ */
/* Alerts, notifications, audit logs                                   */
/* ------------------------------------------------------------------ */
const ALERT_KINDS = [
  { type: 'high_consumption', severity: 'critical', text: (m) => `Meter ${m.id} used far more than its daily limit.` },
  { type: 'tamper_suspected', severity: 'critical', text: (m) => `Possible tampering detected on meter ${m.id}.` },
  { type: 'abnormal_reading', severity: 'warning', text: (m) => `Meter ${m.id} sent readings more often than normal.` },
  { type: 'meter_inactive', severity: 'warning', text: (m) => `Meter ${m.id} has not reported for several days.` },
  { type: 'low_consumption', severity: 'info', text: (m) => `Meter ${m.id} shows unusually low usage.` },
]

const alertDrafts = []
for (const z of zones.filter((x) => x.status === 'active')) {
  const zoneMeters = meters.filter((m) => m.zoneId === z.id)
  for (let i = 0; i < 12; i += 1) {
    const kind = pick(ALERT_KINDS)
    const meter = pick(zoneMeters)
    const ageDays = int(0, 29)
    const createdMs = addDays(TODAY, -ageDays) + int(0, 86_399) * 1000
    const resolved = chance(ageDays > 10 ? 0.8 : 0.25)
    alertDrafts.push({
      zoneId: z.id,
      meterId: meter.id,
      severity: kind.severity,
      type: kind.type,
      message: kind.text(meter),
      status: resolved ? 'resolved' : 'open',
      createdAt: isoTime(Math.min(createdMs, nowReal.getTime())),
    })
  }
}
const alerts = alertDrafts
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .map((a, i) => ({ id: `ALT-${pad(i + 1, 3)}`, ...a }))

const notificationDrafts = []
const pushNotification = (userId, type, title, message, ms, read) =>
  notificationDrafts.push({ userId, type, title, message, createdAt: isoTime(Math.min(ms, nowReal.getTime())), read })

for (const u of users.filter((x) => x.role === 'consumer')) {
  const userBills = bills.filter((b) => b.userId === u.id).sort((a, b) => b.month.localeCompare(a.month))
  const recent = userBills.slice(0, u.id === DEMO_CONSUMER_ID ? 4 : 1)

  recent.forEach((b, i) => {
    pushNotification(u.id, 'bill_generated', 'Bill generated', `Your bill of Rs ${b.amount.toFixed(2)} for ${b.month} is ready.`, Date.parse(b.issuedOn) + 6 * 3_600_000, i > 0)
    if (b.status === 'paid' && b.paidOn) {
      pushNotification(u.id, 'payment_received', 'Payment received', `We received your payment of Rs ${b.amount.toFixed(2)}. Thank you!`, Date.parse(b.paidOn) + 11 * 3_600_000, i > 0)
    } else if (b.status === 'pending') {
      pushNotification(u.id, 'payment_due', 'Payment due soon', `Your bill ${b.id} is due on ${b.dueDate}.`, Math.min(Date.parse(b.dueDate) - 3 * DAY_MS, TODAY), false)
    }
  })

  if (u.id === DEMO_CONSUMER_ID) {
    for (let i = 0; i < 3; i += 1) {
      pushNotification(u.id, 'high_consumption', 'High consumption', 'Your usage today is well above your daily average.', addDays(TODAY, -int(2, 40)) + int(8, 20) * 3_600_000, true)
    }
    for (let i = 0; i < 2; i += 1) {
      pushNotification(u.id, 'maintenance', 'Planned maintenance', 'Power will be off from 10:00 to 12:00 for network maintenance.', addDays(TODAY, -int(3, 60)) + 9 * 3_600_000, true)
    }
  }
}
const notifications = notificationDrafts
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .map((n, i) => ({ id: `NTF-${pad(i + 1, 4)}`, ...n }))

const ADMINS = users.filter((u) => u.role !== 'consumer' && u.status === 'active')
const AUDIT_ACTIONS = [
  ['Logged in', () => 'Session'],
  ['Logged out', () => 'Session'],
  ['Created meter', (zoneId) => `Meter ${pick(meters.filter((m) => !zoneId || m.zoneId === zoneId)).id}`],
  ['Updated meter', (zoneId) => `Meter ${pick(meters.filter((m) => !zoneId || m.zoneId === zoneId)).id}`],
  ['Deactivated meter', (zoneId) => `Meter ${pick(meters.filter((m) => !zoneId || m.zoneId === zoneId)).id}`],
  ['Activated meter', (zoneId) => `Meter ${pick(meters.filter((m) => !zoneId || m.zoneId === zoneId)).id}`],
  ['Updated alert thresholds', (zoneId) => `Zone settings ${zoneId ?? pick(zones).id}`],
  ['Generated report', () => 'Monthly consumption report'],
  ['Exported data', () => 'Meter readings (CSV)'],
  ['Changed zone status', (zoneId) => `Zone ${zoneId ?? pick(zones).id}`],
]
const auditDrafts = Array.from({ length: 80 }, () => {
  const actor = pick(ADMINS)
  const [action, resource] = pick(AUDIT_ACTIONS)
  return {
    timestamp: isoTime(Math.min(addDays(TODAY, -int(0, 44)) + int(0, 86_399) * 1000, nowReal.getTime())),
    userId: actor.id,
    userName: actor.name,
    action,
    resource: resource(actor.zoneId),
    status: chance(0.92) ? 'success' : 'failed',
  }
})
const auditLogs = auditDrafts
  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  .map((l, i) => ({ id: `LOG-${pad(i + 1, 4)}`, ...l }))

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */
const zoneSettings = zones.map((z) => ({
  id: z.id,
  zoneId: z.id,
  highConsumptionKwh: 25, // per meter per day
  lowConsumptionKwh: 1.5,
  abnormalReadingsPerDay: 3,
  inactiveMeterDays: 3,
  channels: { email: true, sms: z.id !== 'Z03', push: true },
}))

const enterpriseSettings = {
  dataRetentionMonths: 24,
  policies: { autoLogoutMinutes: 30, auditLogRetentionMonths: 12 },
  localisation: { timeZone: 'Asia/Kolkata', defaultLanguage: 'en', currency: 'INR' },
  notificationDefaults: { email: true, sms: false, push: true },
}

// Phase 1 has no login: these ids decide who the role switcher "is".
const demoSession = {
  consumerId: demoUser.id,
  consumerMeterId: demoMeter.id,
  zoneId: demoUser.zoneId,
  zoneAdminId: zones.find((z) => z.id === demoUser.zoneId).adminId,
  enterpriseAdminId: 'U-E01',
}

/* ------------------------------------------------------------------ */
/* Assemble + validate + write                                         */
/* ------------------------------------------------------------------ */
const db = {
  demoSession,
  zones,
  zoneSummaries,
  users,
  meters,
  bills,
  billDays,
  readings,
  hourlyReadings,
  consumptionSeries,
  zoneComparison,
  alerts,
  notifications,
  auditLogs,
  zoneSettings,
  enterpriseSettings,
}

function validate() {
  const problems = []
  const check = (ok, message) => {
    if (!ok) problems.push(message)
  }
  const unique = (name, list) => check(new Set(list.map((x) => x.id)).size === list.length, `${name}: duplicate ids`)

  for (const [name, list] of Object.entries(db)) {
    if (Array.isArray(list)) unique(name, list)
  }

  const userById = new Map(users.map((u) => [u.id, u]))
  const zoneIds = new Set(zones.map((z) => z.id))
  for (const m of meters) {
    const owner = userById.get(m.ownerId)
    check(owner !== undefined, `${m.id}: owner ${m.ownerId} does not exist`)
    check(zoneIds.has(m.zoneId), `${m.id}: zone ${m.zoneId} does not exist`)
    check(owner?.zoneId === m.zoneId, `${m.id}: zone differs from its owner's zone`)
    check(owner?.role === 'consumer', `${m.id}: owner is not a consumer`)
  }

  const consumers = users.filter((u) => u.role === 'consumer')
  check(zones.length >= 4, 'fewer than 4 zones')
  for (const z of zones) {
    check(userById.get(z.adminId)?.zoneId === z.id, `${z.id}: admin does not belong to the zone`)
    check(consumers.filter((u) => u.zoneId === z.id).length >= 12, `${z.id}: fewer than 12 customers`)
  }
  check(consumers.some((u) => meters.filter((m) => m.ownerId === u.id).length > 1), 'no customer owns more than one meter')
  for (const u of consumers) {
    check(meters.filter((m) => m.ownerId === u.id).length === u.meterCount, `${u.id}: meterCount mismatch`)
    check(bills.filter((b) => b.userId === u.id).length >= 12, `${u.id}: fewer than 12 bills`)
  }
  for (const status of ['paid', 'pending', 'overdue']) {
    check(bills.some((b) => b.status === status), `no ${status} bills`)
  }
  check(alerts.length >= 20, 'fewer than 20 alerts')
  check(notifications.length >= 15, 'fewer than 15 notifications')
  check(auditLogs.length >= 30, 'fewer than 30 audit logs')
  check(hourlyReadings.length >= 24, 'no hourly readings')

  const demoBills = bills.filter((b) => b.meterId === demoMeter.id)
  for (const b of demoBills) {
    const days = billDays.filter((d) => d.billId === b.id)
    check(days.length === daysIn(Number(b.month.slice(0, 4)) * 12 + Number(b.month.slice(5)) - 1), `${b.id}: wrong number of daily rows`)
    check(Math.abs(sum(days.map((d) => d.consumption)) - b.units) < 0.5, `${b.id}: daily rows do not add up to the bill units`)
  }

  if (problems.length) {
    console.error('\nValidation failed:')
    problems.forEach((p) => console.error(' - ' + p))
    process.exit(1)
  }
}

validate()
writeFileSync(OUT_FILE, JSON.stringify(db, null, 2) + '\n')

console.log(`db.json written to ${OUT_FILE}`)
for (const [name, value] of Object.entries(db)) {
  console.log(`  ${name.padEnd(20)} ${Array.isArray(value) ? value.length : 'object'}`)
}
console.log(`Demo customer: ${demoUser.id} (${demoUser.name}), meter ${demoMeter.id}`)
console.log('Validation passed.')