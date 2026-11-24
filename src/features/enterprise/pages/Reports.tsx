import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import PageHeader from "../../auth/components/PageHeader";
import { useToast } from "../../auth/components/Toast";
import { getEnterpriseMeters, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseMeter, EnterpriseZone } from "../types/enterprise";

export default function Reports() {
  const toast = useToast();
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [meters, setMeters] = useState<EnterpriseMeter[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    Promise.all([getEnterpriseZones(), getEnterpriseMeters()])
      .then(([zoneRows, meterRows]) => {
        setZones(zoneRows);
        setMeters(meterRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => zones.map((zone) => {
    const zoneMeters = meters.filter((meter) => meter.zoneId === zone.zoneId);
    const current = zoneMeters.reduce((sum, meter) => sum + meter.lastReading, 0);
    const previousFactor = period === "week" ? 0.92 : period === "year" ? 0.88 : 0.95;
    return {
      zone: zone.name.replace(" Zone", ""),
      current: Math.round(current),
      previous: Math.round(current * previousFactor),
    };
  }), [zones, meters, period]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & analytics"
        subtitle="Compare consumption across enterprise zones"
        actions={
          <>
            <select aria-label="Report period" value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-control border border-line bg-surface px-3">
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={() => toast.success("Report preview is read-only in Phase 1.")}>Generate report</button>
          </>
        }
      />
      <ChartCard title="Consumption comparison" subtitle={`${period[0].toUpperCase()}${period.slice(1)}ly comparison by zone`} loading={loading} empty={chartData.length === 0} height={360}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="zone" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Legend />
            <Bar dataKey="previous" name="Previous period" fill="var(--color-info)" radius={[5, 5, 0, 0]} />
            <Bar dataKey="current" name="Current period" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

