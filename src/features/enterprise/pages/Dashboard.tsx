import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import PageHeader from "../../auth/components/PageHeader";
import StatCard from "../../auth/components/StatCard";
import StatusBadge from "../../auth/components/StatusBadge";
import { getEnterpriseAlerts, getEnterpriseMeters, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseAlert, EnterpriseMeter, EnterpriseZone } from "../types/enterprise";

export default function Dashboard() {
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [meters, setMeters] = useState<EnterpriseMeter[]>([]);
  const [alerts, setAlerts] = useState<EnterpriseAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEnterpriseZones(), getEnterpriseMeters(), getEnterpriseAlerts()])
      .then(([zoneRows, meterRows, alertRows]) => {
        setZones(zoneRows);
        setMeters(meterRows);
        setAlerts(alertRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => zones.map((zone) => {
    const zoneMeters = meters.filter((meter) => meter.zoneId === zone.zoneId);
    const average = zoneMeters.length
      ? zoneMeters.reduce((sum, meter) => sum + meter.lastReading, 0) / zoneMeters.length
      : 0;
    return { zone: zone.name.replace(" Zone", ""), average: Math.round(average) };
  }), [zones, meters]);

  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" && alert.status === "open");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Enterprise dashboard"
        subtitle="Organization-wide meter operations"
        actions={<Link to="/enterprise/reports" className="btn btn-primary">View reports</Link>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total zones" value={zones.length} hint={`${zones.filter((zone) => zone.status === "active").length} active zones`} loading={loading} to="/enterprise/zones" />
        <StatCard label="Total meters" value={meters.length} hint="Across all zones" loading={loading} tone="info" to="/enterprise/meters" />
        <StatCard label="Critical alerts" value={criticalAlerts.length} hint="Open critical alerts" loading={loading} tone="danger" to="/enterprise/alerts" />
      </div>

      <ChartCard title="Average consumption per zone" subtitle="Latest meter reading average (kWh)" loading={loading} empty={chartData.length === 0} height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="zone" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Bar dataKey="average" name="Average kWh" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Recent critical alerts</h2>
          <Link to="/enterprise/alerts" className="text-sm font-bold text-primary">View all →</Link>
        </div>
        {loading ? (
          <div className="h-24 animate-pulse rounded-control bg-line" />
        ) : criticalAlerts.length === 0 ? (
          <p className="text-muted">No open critical alerts.</p>
        ) : (
          <ul className="divide-y divide-line">
            {criticalAlerts.slice(0, 4).map((alert) => (
              <li key={alert.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-bold">{alert.title}</p>
                  <p className="text-[13px] text-muted">{alert.zoneId} · {alert.meterId} · {alert.createdAt}</p>
                </div>
                <StatusBadge status="critical" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

