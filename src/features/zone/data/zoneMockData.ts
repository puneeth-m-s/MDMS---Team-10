import type {
  ChartPoint,
  Customer,
  Meter,
  MeterReading,
  ReportSummaryRow,
  ZoneAlert,
  ZoneSettings,
} from "../types/zone";

export const zoneMeters: Meter[] = [
  { id: "1", meterId: "MTR-1001", ownerId: "C-001", owner: "Aarav Sharma", status: "active", lastReading: 1248.6, address: "18 Lake View Road", installedDate: "2024-03-12", tariffCategory: "Residential", lastReadingDate: "2026-11-24" },
  { id: "2", meterId: "MTR-1002", ownerId: "C-002", owner: "Meera Iyer", status: "active", lastReading: 982.4, address: "42 MG Avenue", installedDate: "2024-05-20", tariffCategory: "Residential", lastReadingDate: "2026-11-24" },
  { id: "3", meterId: "MTR-1003", ownerId: "C-003", owner: "Greenmart Stores", status: "inactive", lastReading: 1567.8, address: "7 Market Street", installedDate: "2023-11-08", tariffCategory: "Commercial", lastReadingDate: "2026-11-18" },
  { id: "4", meterId: "MTR-1004", ownerId: "C-004", owner: "Vikram Patel", status: "active", lastReading: 744.2, address: "91 Temple Road", installedDate: "2025-01-16", tariffCategory: "Residential", lastReadingDate: "2026-11-24" },
  { id: "5", meterId: "MTR-1005", ownerId: "C-005", owner: "Northside Industries", status: "deactivated", lastReading: 2841.5, address: "3 Industrial Estate", installedDate: "2022-08-02", tariffCategory: "Industrial", lastReadingDate: "2026-11-10" },
  { id: "6", meterId: "MTR-1006", ownerId: "C-001", owner: "Aarav Sharma", status: "active", lastReading: 611.3, address: "18 Lake View Road", installedDate: "2025-06-14", tariffCategory: "Residential", lastReadingDate: "2026-11-23" },
  { id: "7", meterId: "MTR-1007", ownerId: "C-006", owner: "Priya Menon", status: "active", lastReading: 1095.7, address: "26 River Colony", installedDate: "2024-09-29", tariffCategory: "Residential", lastReadingDate: "2026-11-24" },
  { id: "8", meterId: "MTR-1008", ownerId: "C-007", owner: "Sanjay Kumar", status: "inactive", lastReading: 493.1, address: "55 Station Road", installedDate: "2023-12-11", tariffCategory: "Commercial", lastReadingDate: "2026-11-16" },
];

export const zoneCustomers: Customer[] = [
  { id: "C-001", name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+91 98765 10001", meterIds: ["MTR-1001", "MTR-1006"], status: "active", address: "18 Lake View Road" },
  { id: "C-002", name: "Meera Iyer", email: "meera.iyer@example.com", phone: "+91 98765 10002", meterIds: ["MTR-1002"], status: "active", address: "42 MG Avenue" },
  { id: "C-003", name: "Greenmart Stores", email: "accounts@greenmart.example", phone: "+91 98765 10003", meterIds: ["MTR-1003"], status: "active", address: "7 Market Street" },
  { id: "C-004", name: "Vikram Patel", email: "vikram.patel@example.com", phone: "+91 98765 10004", meterIds: ["MTR-1004"], status: "active", address: "91 Temple Road" },
  { id: "C-005", name: "Northside Industries", email: "power@northside.example", phone: "+91 98765 10005", meterIds: ["MTR-1005"], status: "inactive", address: "3 Industrial Estate" },
  { id: "C-006", name: "Priya Menon", email: "priya.menon@example.com", phone: "+91 98765 10006", meterIds: ["MTR-1007"], status: "active", address: "26 River Colony" },
  { id: "C-007", name: "Sanjay Kumar", email: "sanjay.kumar@example.com", phone: "+91 98765 10007", meterIds: ["MTR-1008"], status: "inactive", address: "55 Station Road" },
];

export const zoneReadings: MeterReading[] = [
  { id: "R-1", meterId: "MTR-1001", readingDate: "2026-11-24", consumption: 14.8, reading: 1248.6, status: "success" },
  { id: "R-2", meterId: "MTR-1001", readingDate: "2026-11-23", consumption: 13.9, reading: 1233.8, status: "success" },
  { id: "R-3", meterId: "MTR-1001", readingDate: "2026-11-22", consumption: 15.4, reading: 1219.9, status: "success" },
  { id: "R-4", meterId: "MTR-1001", readingDate: "2026-11-21", consumption: 22.1, reading: 1204.5, status: "warning" },
  { id: "R-5", meterId: "MTR-1001", readingDate: "2026-11-20", consumption: 12.6, reading: 1182.4, status: "success" },
];

export const zoneAlerts: ZoneAlert[] = [
  { id: "A-1", meterId: "MTR-1003", owner: "Greenmart Stores", severity: "critical", status: "open", title: "Abnormally high consumption", description: "Consumption exceeded the configured threshold by 38%.", createdAt: "2026-11-24 09:14" },
  { id: "A-2", meterId: "MTR-1008", owner: "Sanjay Kumar", severity: "warning", status: "open", title: "No readings received", description: "The meter has not reported readings for 8 days.", createdAt: "2026-11-23 18:32" },
  { id: "A-3", meterId: "MTR-1001", owner: "Aarav Sharma", severity: "warning", status: "resolved", title: "Reading frequency warning", description: "A reading gap was detected and cleared after the next successful reading.", createdAt: "2026-11-22 11:05" },
  { id: "A-4", meterId: "MTR-1005", owner: "Northside Industries", severity: "critical", status: "resolved", title: "Meter disconnected", description: "Meter communication was restored after maintenance.", createdAt: "2026-11-18 15:40" },
  { id: "A-5", meterId: "MTR-1007", owner: "Priya Menon", severity: "info", status: "open", title: "Scheduled calibration", description: "Calibration is due within the next 7 days.", createdAt: "2026-11-17 08:20" },
];

export const zoneSettings: ZoneSettings = {
  id: "zone-default",
  highConsumption: 20,
  lowConsumption: 2,
  abnormalReadingFrequency: 48,
  inactiveMeterDuration: 7,
  channels: { email: true, sms: true, push: false },
};

export const zoneWeeklyConsumption: ChartPoint[] = [
  { label: "Mon", value: 312, comparison: 298 },
  { label: "Tue", value: 348, comparison: 320 },
  { label: "Wed", value: 326, comparison: 335 },
  { label: "Thu", value: 391, comparison: 350 },
  { label: "Fri", value: 372, comparison: 360 },
  { label: "Sat", value: 420, comparison: 378 },
  { label: "Sun", value: 405, comparison: 389 },
];

export const zoneMonthlyConsumption: ChartPoint[] = [
  { label: "Week 1", value: 2210, comparison: 2140 },
  { label: "Week 2", value: 2384, comparison: 2250 },
  { label: "Week 3", value: 2298, comparison: 2320 },
  { label: "Week 4", value: 2512, comparison: 2400 },
];

export const zoneReportSummary: ReportSummaryRow[] = [
  { meterId: "MTR-1001", owner: "Aarav Sharma", consumption: 96.8, cost: 774, changePercent: 4.2, status: "active" },
  { meterId: "MTR-1002", owner: "Meera Iyer", consumption: 82.5, cost: 660, changePercent: -2.1, status: "active" },
  { meterId: "MTR-1003", owner: "Greenmart Stores", consumption: 134.2, cost: 1074, changePercent: 12.8, status: "inactive" },
  { meterId: "MTR-1004", owner: "Vikram Patel", consumption: 68.9, cost: 551, changePercent: -1.4, status: "active" },
  { meterId: "MTR-1005", owner: "Northside Industries", consumption: 210.6, cost: 1685, changePercent: 0.8, status: "deactivated" },
];

