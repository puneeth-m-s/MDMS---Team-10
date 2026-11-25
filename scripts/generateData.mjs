import { writeFile } from 'node:fs/promises'

const zoneSpecs = [
  { id: 'zone-mangalore', name: 'Mangalore', location: 'Dakshina Kannada', pincode: '575001', description: 'Coastal urban service area' },
  { id: 'zone-udupi', name: 'Udupi', location: 'Udupi', pincode: '576101', description: 'Udupi city and nearby communities' },
  { id: 'zone-surathkal', name: 'Surathkal', location: 'Mangalore North', pincode: '575014', description: 'Northern coastal service area' },
  { id: 'zone-mulki', name: 'Mulki', location: 'Dakshina Kannada', pincode: '574154', description: 'Mulki town and surrounding villages' },
]
const people = ['Ananya Rao', 'Rahul Shetty', 'Kavya Bhat', 'Nikhil Poojary', 'Diya Nayak', 'Arjun Hegde', 'Mira Kamath', 'Rohan Pai', 'Sana D’Souza', 'Ishaan Rai', 'Leela Shenoy', 'Vikram Acharya']
const months = Array.from({ length: 12 }, (_, index) => new Date(Date.UTC(2025, 11 + index, 1)))
const isoDay = (date) => date.toISOString().slice(0, 10)
const money = (value) => Math.round(value * 100) / 100

const db = { zones: [], users: [], meters: [], bills: [], billDays: [], chartSeries: [], readings: [], hourlyReadings: [], alerts: [], notifications: [], auditLogs: [], zoneSettings: [], enterpriseSettings: [] }

db.zones = zoneSpecs.map((zone) => ({ ...zone, adminId: `admin-${zone.id.slice(5)}`, status: 'Active' }))
db.users.push({ id: 'enterprise-admin', name: 'Meera Kulkarni', email: 'meera.kulkarni@meterwise.in', phone: '+91 98450 10001', role: 'enterprise', zoneId: null, status: 'Active', joinedAt: '2024-01-15' })

for (const [zoneIndex, zone] of zoneSpecs.entries()) {
  const zoneKey = zone.id.slice(5)
  db.users.push({ id: `admin-${zoneKey}`, name: ['Sahana Nayak', 'Pranav Shetty', 'Asha Bhat', 'Ritesh Rao'][zoneIndex], email: `admin.${zoneKey}@meterwise.in`, phone: `+91 98450 20${String(zoneIndex + 1).padStart(2, '0')}`, role: 'zone-admin', zoneId: zone.id, status: 'Active', joinedAt: '2024-03-01' })
  for (let customerIndex = 0; customerIndex < 12; customerIndex += 1) {
    const number = zoneIndex * 12 + customerIndex + 1
    const userId = `customer-${String(number).padStart(3, '0')}`
    const fullName = people[customerIndex]
    db.users.push({ id: userId, name: number === 1 ? 'Ananya Rao' : `${fullName.split(' ')[0]} ${zoneIndex ? zone.name : fullName.split(' ')[1]}`, email: `customer${String(number).padStart(3, '0')}@example.in`, phone: `+91 98${String(44000000 + number).slice(0, 8)}`, role: 'end-user', zoneId: zone.id, status: number % 17 === 0 ? 'Deactivated' : 'Active', joinedAt: number % 3 === 0 ? '2026-02-12' : number % 3 === 1 ? '2025-06-12' : '2024-06-12' })
    const meterCount = customerIndex % 5 === 0 ? 2 : 1
    db.users.find((user) => user.id === userId).meterCount = meterCount
    for (let meterIndex = 1; meterIndex <= meterCount; meterIndex += 1) {
      const meterNumber = `MW-${String(number).padStart(4, '0')}-${meterIndex}`
      db.meters.push({ id: meterNumber, ownerId: userId, ownerName: db.users.find((person) => person.id === userId).name, zoneId: zone.id, zoneName: zone.name, status: number % 17 === 0 ? 'Deactivated' : 'Active', lastReading: 8500 + number * 46 + meterIndex * 110, lastReadingAt: '2026-11-24T18:30:00.000Z', installedDate: `202${number % 4}-0${number % 8 + 1}-15`, tariffCategory: number % 4 === 0 ? 'Commercial' : 'Domestic', address: `${12 + number} ${['Church Street', 'Temple Road', 'Beach Road', 'Market Lane'][customerIndex % 4]}, ${zone.name}` })
    }
  }
}

for (const zone of db.zones) {
  zone.adminName = db.users.find((user) => user.id === zone.adminId).name
  zone.meterCount = db.meters.filter((meter) => meter.zoneId === zone.id).length
}

for (const user of db.users.filter((entry) => entry.role === 'end-user')) {
  const meter = db.meters.find((entry) => entry.ownerId === user.id)
  for (const [monthIndex, monthDate] of months.entries()) {
    const nextMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1))
    const monthId = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`
    const amount = money(2150 + (Number(user.id.slice(-3)) * 31 + monthIndex * 67) % 1600)
    const status = monthIndex === 11 ? 'Pending' : monthIndex === 10 && Number(user.id.slice(-3)) % 3 === 0 ? 'Overdue' : monthIndex % 4 === 0 ? 'Overdue' : 'Paid'
    const billId = `bill-${user.id}-${monthId}`
    db.bills.push({ id: billId, userId: user.id, meterId: meter.id, month: monthId, amount, dueDate: `${monthId}-10`, status, paidOn: status === 'Paid' ? `${monthId}-08` : null })
    const days = Math.round((nextMonth - monthDate) / 86400000)
    const dailyConsumption = 9.2 + monthIndex / 8
    for (let day = 0; day < days; day += 1) {
        const date = new Date(monthDate)
        date.setUTCDate(day + 1)
        const consumption = money(dailyConsumption + ((day * 7 + monthIndex) % 13) / 10)
        const reading = money(16420 + Number(user.id.slice(-3)) * 40 + monthIndex * 315 + day * dailyConsumption)
        if (user.id === 'customer-001') db.billDays.push({ id: `${billId}-day-${String(day + 1).padStart(2, '0')}`, billId, date: isoDay(date), reading, consumption, cost: money(consumption * 8.4) })
        db.readings.push({ id: `reading-${meter.id}-${isoDay(date)}`, meterId: meter.id, date: isoDay(date), reading, difference: consumption, notes: day % 11 === 0 ? 'Peak-hour use' : 'Normal reading' })
      }
  }
}

const firstMeter = db.meters[0]
for (let hour = 0; hour < 24; hour += 1) {
  const consumption = money(0.22 + ((hour * 7) % 11) / 20)
  db.hourlyReadings.push({ id: `hour-${String(hour).padStart(2, '0')}`, meterId: firstMeter.id, timestamp: `2026-11-24T${String(hour).padStart(2, '0')}:00:00.000Z`, reading: money(20500 + hour * 0.38), consumption })
}

for (const [range, count] of [['day', 24], ['week', 7], ['month', 5], ['year', 12]]) {
  for (let index = 0; index < count; index += 1) {
    const value = money(12 + (index * 13 % 31) / 4 + (range === 'day' ? 4 : 0))
    const period = range === 'day' ? `${String(index).padStart(2, '0')}:00` : range === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : range === 'month' ? `Week ${index + 1}` : months[index].toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })
    db.chartSeries.push({ id: `user-${range}-${index + 1}`, scope: 'user', scopeId: 'customer-001', range, period, value, previous: money(value * (index % 2 ? 0.92 : 1.08)) })
  }
}

for (const zone of zoneSpecs) {
  for (let index = 0; index < 7; index += 1) {
    const period = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
    const value = 2100 + zoneSpecs.indexOf(zone) * 180 + index * 32
    db.chartSeries.push({ id: `zone-week-${zone.id}-${index + 1}`, scope: 'zone', scopeId: zone.id, range: 'week', period, value, previous: money(value * 0.94) })
  }
  for (let index = 0; index < 12; index += 1) {
    const period = months[index].toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })
    const value = 280 + zoneSpecs.indexOf(zone) * 18 + index * 3 + (index % 3) * 7
    db.chartSeries.push({ id: `zone-${zone.id}-${index + 1}`, scope: 'zone', scopeId: zone.id, range: 'month', period, value, previous: money(value * 0.94) })
    db.chartSeries.push({ id: `enterprise-${zone.id}-${index + 1}`, scope: 'enterprise', scopeId: 'all', range: 'year', period: `${period} · ${zone.name}`, zoneName: zone.name, value, previous: money(value * 0.94) })
    db.chartSeries.push({ id: `enterprise-month-${zone.id}-${index + 1}`, scope: 'enterprise', scopeId: 'all', range: 'month', period, zoneName: zone.name, value, previous: money(value * 0.94) })
  }
}
for (const zone of zoneSpecs) db.chartSeries.push({ id: `enterprise-zone-${zone.id}`, scope: 'enterprise', scopeId: 'all', range: 'current', period: zone.name, zoneName: zone.name, value: 318 + zoneSpecs.indexOf(zone) * 28, previous: 300 + zoneSpecs.indexOf(zone) * 25 })

for (let index = 0; index < 24; index += 1) {
  const zone = zoneSpecs[index % zoneSpecs.length]
  const meter = db.meters.find((item) => item.zoneId === zone.id)
  db.alerts.push({ id: `alert-${String(index + 1).padStart(3, '0')}`, zoneId: zone.id, zoneName: zone.name, meterId: meter.id, title: ['Unusual overnight consumption', 'Reading has not updated', 'Consumption above expected range', 'Voltage fluctuation detected'][index % 4], severity: index % 3 === 0 ? 'Critical' : 'Warning', status: index % 4 === 0 ? 'Resolved' : 'Open', createdAt: new Date(Date.UTC(2026, 10, 24 - index, 9 + index % 9)).toISOString() })
}

for (let index = 0; index < 20; index += 1) db.notifications.push({ id: `notification-${String(index + 1).padStart(3, '0')}`, userId: 'customer-001', title: ['Your monthly bill is ready', 'Payment received', 'High consumption notice', 'Scheduled meter maintenance'][index % 4], message: ['Your latest bill is available to review.', 'We recorded your recent payment.', 'Your usage is above your recent average.', 'Meter service is planned for your area.'][index % 4], type: ['Bill', 'Payment', 'Consumption', 'Maintenance'][index % 4], read: index % 3 === 0, createdAt: new Date(Date.UTC(2026, 10, 24 - index, 12)).toISOString() })

for (let index = 0; index < 36; index += 1) {
  const zone = zoneSpecs[index % zoneSpecs.length]
  const actor = db.users.find((user) => user.id === `admin-${zone.id.slice(5)}`)
    db.auditLogs.push({ id: `audit-${String(index + 1).padStart(3, '0')}`, timestamp: new Date(Date.UTC(2026, 10, 24 - index, 10 + index % 9)).toISOString(), userId: actor.id, userName: actor.name, action: ['Viewed meter record', 'Reviewed alert', 'Updated zone threshold', 'Report viewed'][index % 4], resource: ['Meter', 'Alert', 'Zone settings', 'Report'][index % 4], status: index % 11 === 0 ? 'Failed' : 'Success' })
}

db.zoneSettings = zoneSpecs.map((zone) => ({ id: `settings-${zone.id}`, zoneId: zone.id, highConsumption: 28, lowConsumption: 1.5, abnormalFrequencyHours: 6, inactiveMeterDays: 30, emailEnabled: true, smsEnabled: false }))
db.enterpriseSettings = [{ id: 'enterprise-default', dataRetentionYears: 7, autoLogoutMinutes: 30, auditRetentionYears: 5, timeZone: 'Asia/Kolkata', language: 'English', currency: 'INR', emailEnabled: true, smsEnabled: true }]

await writeFile(new URL('../db.json', import.meta.url), `${JSON.stringify(db, null, 2)}\n`, 'utf8')
console.log(`Generated ${db.users.length} users, ${db.meters.length} meters, ${db.bills.length} bills, ${db.billDays.length} bill-day readings, ${db.alerts.length} alerts, ${db.notifications.length} notifications and ${db.auditLogs.length} audit records.`)
