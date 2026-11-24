import type { BadgeStatus } from "../../auth/components/StatusBadge";

export type MeterStatus = "active" | "deactivated" | "inactive";
export type TariffCategory = "Residential" | "Commercial" | "Industrial";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "open" | "resolved";

export interface Meter {
  id: string;
  meterId: string;
  ownerId: string;
  owner: string;
  status: MeterStatus;
  lastReading: number;
  address: string;
  installedDate: string;
  tariffCategory: TariffCategory;
  lastReadingDate: string;
}

export interface MeterReading {
  id: string;
  meterId: string;
  readingDate: string;
  consumption: number;
  reading: number;
  status: BadgeStatus;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  meterIds: string[];
  status: "active" | "inactive";
  address: string;
}

export interface ZoneAlert {
  id: string;
  meterId: string;
  owner: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  createdAt: string;
}

export interface ChartPoint {
  label: string;
  value: number;
  comparison?: number;
}

export interface ReportSummaryRow {
  meterId: string;
  owner: string;
  consumption: number;
  cost: number;
  changePercent: number;
  status: MeterStatus;
}

export interface ZoneSettings {
  id: string;
  highConsumption: number;
  lowConsumption: number;
  abnormalReadingFrequency: number;
  inactiveMeterDuration: number;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface AddMeterValues {
  meterId: string;
  ownerId: string;
  owner: string;
  address: string;
  installedDate: string;
  tariffCategory: TariffCategory;
  initialReading: number;
}

