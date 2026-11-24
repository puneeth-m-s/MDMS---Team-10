import API from "../../../services/http";
import {
  enterpriseAlerts,
  enterpriseAuditLogs,
  enterpriseMeters,
  enterpriseSettings,
  enterpriseUsers,
  enterpriseZones,
} from "../data/enterpriseMockData";
import type {
  AuditLog,
  EnterpriseAlert,
  EnterpriseMeter,
  EnterpriseSettings,
  EnterpriseUser,
  EnterpriseZone,
} from "../types/enterprise";

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

export async function getEnterpriseZones(): Promise<EnterpriseZone[]> {
  const zones = await getOrFallback("/enterpriseZones", enterpriseZones);
  const meters = await getExistingMeters();
  return zones.map((zone) => ({
    ...zone,
    totalMeters: meters.filter((meter) => meter.zoneId === zone.zoneId).length,
  }));
}

export async function getEnterpriseMeters(): Promise<EnterpriseMeter[]> {
  const existing = await getOrFallback<EnterpriseMeter[]>(
    "/zoneMeters",
    enterpriseMeters,
  );
  if (existing === enterpriseMeters) return existing;
  return existing.map((meter) => {
    const numericId = Number(meter.meterId.replace(/\D/g, ""));
    const zoneId =
      numericId <= 1002 ? "ZN-001" :
      numericId <= 1004 ? "ZN-002" :
      numericId <= 1006 ? "ZN-003" : "ZN-004";
    return { ...meter, zoneId };
  });
}

async function getExistingMeters(): Promise<EnterpriseMeter[]> {
  return getEnterpriseMeters();
}

export const getEnterpriseUsers = (): Promise<EnterpriseUser[]> =>
  getOrFallback("/enterpriseUsers", enterpriseUsers);

export const getEnterpriseAlerts = (): Promise<EnterpriseAlert[]> =>
  getOrFallback(
    "/zoneAlerts",
    enterpriseAlerts.map((alert) => ({
      id: alert.id,
      meterId: alert.meterId,
      owner: alert.owner,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      description: alert.description,
      createdAt: alert.createdAt,
      zoneId: alert.zoneId,
    })),
  ).then((alerts) =>
    alerts.map((alert) => {
      const numericId = Number(alert.meterId.replace(/\D/g, ""));
      const zoneId =
        numericId <= 1002 ? "ZN-001" :
        numericId <= 1004 ? "ZN-002" :
        numericId <= 1006 ? "ZN-003" : "ZN-004";
      return { ...alert, zoneId };
    }),
  );

export const getEnterpriseAuditLogs = (): Promise<AuditLog[]> =>
  getOrFallback("/enterpriseAuditLogs", enterpriseAuditLogs);

export const getEnterpriseSettings = (): Promise<EnterpriseSettings> =>
  getOrFallback("/enterpriseSettings", enterpriseSettings);

