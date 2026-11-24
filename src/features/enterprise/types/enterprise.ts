import type { BadgeStatus } from "../../auth/components/StatusBadge";

export type ActiveStatus = "active" | "deactivated" | "inactive";
export type EnterpriseRole = "Zone Admin" | "Consumer";

export interface EnterpriseZone {
  id: string;
  zoneId: string;
  name: string;
  assignedAdmin: string;
  location: string;
  pincode: string;
  description: string;
  status: "active" | "deactivated";
  totalMeters: number;
}

export interface EnterpriseMeter {
  id: string;
  meterId: string;
  ownerId: string;
  owner: string;
  status: "active" | "deactivated" | "inactive";
  lastReading: number;
  address: string;
  installedDate: string;
  tariffCategory: "Residential" | "Commercial" | "Industrial";
  lastReadingDate: string;
  zoneId: string;
}

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: EnterpriseRole;
  zoneId: string;
  status: "active" | "deactivated";
}

export interface EnterpriseAlert {
  id: string;
  meterId: string;
  owner: string;
  zoneId: string;
  severity: "critical" | "warning" | "info";
  status: "open" | "resolved";
  title: string;
  description: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: BadgeStatus;
}

export interface EnterpriseSettings {
  id: string;
  dataRetentionDays: number;
  autoLogoutMinutes: number;
  auditLogRetentionDays: number;
  timeZone: string;
  defaultLanguage: "English" | "Hindi" | "Tamil";
  currency: "INR";
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface AddZoneValues {
  name: string;
  admin: string;
  location: string;
  pincode: string;
  description: string;
}

