import API from "../../../services/http";
import {
  zoneAlerts,
  zoneCustomers,
  zoneMeters,
  zoneMonthlyConsumption,
  zoneReadings,
  zoneReportSummary,
  zoneSettings,
  zoneWeeklyConsumption,
} from "../data/zoneMockData";
import type {
  ChartPoint,
  Customer,
  Meter,
  MeterReading,
  ReportSummaryRow,
  ZoneAlert,
  ZoneSettings,
} from "../types/zone";

async function getOrFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await API.get<T>(path, { timeout: 1500 });
    return Array.isArray(response.data) && response.data.length === 0
      ? fallback
      : response.data;
  } catch {
    return fallback;
  }
}

export const getZoneMeters = (): Promise<Meter[]> =>
  getOrFallback("/zoneMeters", zoneMeters);

export const getZoneCustomers = (): Promise<Customer[]> =>
  getOrFallback("/zoneCustomers", zoneCustomers);

export const getZoneAlerts = (): Promise<ZoneAlert[]> =>
  getOrFallback("/zoneAlerts", zoneAlerts);

export const getZoneSettings = (): Promise<ZoneSettings> =>
  getOrFallback("/zoneSettings", zoneSettings);

export const getZoneWeeklyConsumption = (): Promise<ChartPoint[]> =>
  getOrFallback("/zoneWeeklyConsumption", zoneWeeklyConsumption);

export const getZoneMonthlyConsumption = (): Promise<ChartPoint[]> =>
  getOrFallback("/zoneMonthlyConsumption", zoneMonthlyConsumption);

export const getZoneReadings = (meterId: string): Promise<MeterReading[]> =>
  getOrFallback("/zoneReadings", zoneReadings).then((readings) =>
    readings.filter((reading) => reading.meterId === meterId),
  );

export const getZoneReportSummary = (): Promise<ReportSummaryRow[]> =>
  getOrFallback("/zoneReportSummary", zoneReportSummary);

