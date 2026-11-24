import type {
  AuditLog,
  EnterpriseAlert,
  EnterpriseMeter,
  EnterpriseSettings,
  EnterpriseUser,
  EnterpriseZone,
} from "../types/enterprise";

export const enterpriseZones: EnterpriseZone[] = [
  { id: "1", zoneId: "ZN-001", name: "North Zone", assignedAdmin: "Neha Rao", location: "North District", pincode: "560001", description: "Northern residential and commercial distribution area.", status: "active", totalMeters: 2 },
  { id: "2", zoneId: "ZN-002", name: "Central Zone", assignedAdmin: "Arjun Nair", location: "Central District", pincode: "560002", description: "Central business and mixed-use distribution area.", status: "active", totalMeters: 2 },
  { id: "3", zoneId: "ZN-003", name: "South Zone", assignedAdmin: "Kavya Singh", location: "South District", pincode: "560003", description: "Southern industrial and residential distribution area.", status: "active", totalMeters: 2 },
  { id: "4", zoneId: "ZN-004", name: "East Zone", assignedAdmin: "Rahul Das", location: "East District", pincode: "560004", description: "Eastern residential distribution area.", status: "deactivated", totalMeters: 2 },
];

export const enterpriseMeters: EnterpriseMeter[] = [
  { id: "1", meterId: "MTR-1001", ownerId: "C-001", owner: "Aarav Sharma", status: "active", lastReading: 1248.6, address: "18 Lake View Road", installedDate: "2024-03-12", tariffCategory: "Residential", lastReadingDate: "2026-11-24", zoneId: "ZN-001" },
  { id: "2", meterId: "MTR-1002", ownerId: "C-002", owner: "Meera Iyer", status: "active", lastReading: 982.4, address: "42 MG Avenue", installedDate: "2024-05-20", tariffCategory: "Residential", lastReadingDate: "2026-11-24", zoneId: "ZN-001" },
  { id: "3", meterId: "MTR-1003", ownerId: "C-003", owner: "Greenmart Stores", status: "inactive", lastReading: 1567.8, address: "7 Market Street", installedDate: "2023-11-08", tariffCategory: "Commercial", lastReadingDate: "2026-11-18", zoneId: "ZN-002" },
  { id: "4", meterId: "MTR-1004", ownerId: "C-004", owner: "Vikram Patel", status: "active", lastReading: 744.2, address: "91 Temple Road", installedDate: "2025-01-16", tariffCategory: "Residential", lastReadingDate: "2026-11-24", zoneId: "ZN-002" },
  { id: "5", meterId: "MTR-1005", ownerId: "C-005", owner: "Northside Industries", status: "deactivated", lastReading: 2841.5, address: "3 Industrial Estate", installedDate: "2022-08-02", tariffCategory: "Industrial", lastReadingDate: "2026-11-10", zoneId: "ZN-003" },
  { id: "6", meterId: "MTR-1006", ownerId: "C-001", owner: "Aarav Sharma", status: "active", lastReading: 611.3, address: "18 Lake View Road", installedDate: "2025-06-14", tariffCategory: "Residential", lastReadingDate: "2026-11-23", zoneId: "ZN-003" },
  { id: "7", meterId: "MTR-1007", ownerId: "C-006", owner: "Priya Menon", status: "active", lastReading: 1095.7, address: "26 River Colony", installedDate: "2024-09-29", tariffCategory: "Residential", lastReadingDate: "2026-11-24", zoneId: "ZN-004" },
  { id: "8", meterId: "MTR-1008", ownerId: "C-007", owner: "Sanjay Kumar", status: "inactive", lastReading: 493.1, address: "55 Station Road", installedDate: "2023-12-11", tariffCategory: "Commercial", lastReadingDate: "2026-11-16", zoneId: "ZN-004" },
];

export const enterpriseUsers: EnterpriseUser[] = [
  { id: "U-001", name: "Neha Rao", email: "neha.rao@mdms.in", role: "Zone Admin", zoneId: "ZN-001", status: "active" },
  { id: "U-002", name: "Arjun Nair", email: "arjun.nair@mdms.in", role: "Zone Admin", zoneId: "ZN-002", status: "active" },
  { id: "U-003", name: "Kavya Singh", email: "kavya.singh@mdms.in", role: "Zone Admin", zoneId: "ZN-003", status: "active" },
  { id: "U-004", name: "Rahul Das", email: "rahul.das@mdms.in", role: "Zone Admin", zoneId: "ZN-004", status: "deactivated" },
  { id: "C-001", name: "Aarav Sharma", email: "aarav.sharma@example.com", role: "Consumer", zoneId: "ZN-001", status: "active" },
  { id: "C-003", name: "Greenmart Stores", email: "accounts@greenmart.example", role: "Consumer", zoneId: "ZN-002", status: "active" },
  { id: "C-005", name: "Northside Industries", email: "power@northside.example", role: "Consumer", zoneId: "ZN-003", status: "deactivated" },
  { id: "C-007", name: "Sanjay Kumar", email: "sanjay.kumar@example.com", role: "Consumer", zoneId: "ZN-004", status: "deactivated" },
];

export const enterpriseAlerts: EnterpriseAlert[] = [
  { id: "A-1", meterId: "MTR-1003", owner: "Greenmart Stores", zoneId: "ZN-002", severity: "critical", status: "open", title: "Abnormally high consumption", description: "Consumption exceeded the configured threshold by 38%.", createdAt: "2026-11-24 09:14" },
  { id: "A-2", meterId: "MTR-1008", owner: "Sanjay Kumar", zoneId: "ZN-004", severity: "warning", status: "open", title: "No readings received", description: "The meter has not reported readings for 8 days.", createdAt: "2026-11-23 18:32" },
  { id: "A-3", meterId: "MTR-1001", owner: "Aarav Sharma", zoneId: "ZN-001", severity: "warning", status: "resolved", title: "Reading frequency warning", description: "A reading gap was detected and cleared.", createdAt: "2026-11-22 11:05" },
  { id: "A-4", meterId: "MTR-1005", owner: "Northside Industries", zoneId: "ZN-003", severity: "critical", status: "resolved", title: "Meter disconnected", description: "Meter communication was restored.", createdAt: "2026-11-18 15:40" },
];

export const enterpriseAuditLogs: AuditLog[] = [
  { id: "LG-1001", timestamp: "2026-11-24 09:42", user: "Neha Rao", action: "Viewed meter details", resource: "MTR-1001", status: "success" },
  { id: "LG-1002", timestamp: "2026-11-24 09:18", user: "Arjun Nair", action: "Updated alert status", resource: "A-1", status: "success" },
  { id: "LG-1003", timestamp: "2026-11-23 17:35", user: "System", action: "Meter communication failed", resource: "MTR-1008", status: "failed" },
  { id: "LG-1004", timestamp: "2026-11-23 14:10", user: "Kavya Singh", action: "Generated report", resource: "ZN-003", status: "success" },
];

export const enterpriseSettings: EnterpriseSettings = {
  id: "enterprise-default",
  dataRetentionDays: 365,
  autoLogoutMinutes: 30,
  auditLogRetentionDays: 730,
  timeZone: "Asia/Kolkata",
  defaultLanguage: "English",
  currency: "INR",
  channels: { email: true, sms: true, push: false },
};

