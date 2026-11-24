import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { type TimeRange } from "../../auth/components/ChartCard";
import PageHeader from "../../auth/components/PageHeader";
import StatCard from "../../auth/components/StatCard";
import { useToast } from "../../auth/components/Toast";
import AddMeterModal from "../components/AddMeterModal";
import {
  getZoneAlerts,
  getZoneMeters,
  getZoneMonthlyConsumption,
  getZoneWeeklyConsumption,
} from "../services/zoneService";
import type { AddMeterValues, ChartPoint, Meter, ZoneAlert } from "../types/zone";

export default function Dashboard() {
  const toast = useToast();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<ZoneAlert[]>([]);
  const [week, setWeek] = useState<ChartPoint[]>([]);
  const [month, setMonth] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<TimeRange>("week");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getZoneMeters(),
      getZoneAlerts(),
      getZoneWeeklyConsumption(),
      getZoneMonthlyConsumption(),
    ])
      .then(([meterRows, alertRows, weekRows, monthRows]) => {
        setMeters(meterRows);
        setAlerts(alertRows);
        setWeek(weekRows);
        setMonth(monthRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeMeters = meters.filter((meter) => meter.status === "active").length;
  const pendingAlerts = alerts.filter((alert) => alert.status === "open").length;
  const averageUsage = useMemo(() => {
    if (meters.length === 0) return 0;
    return meters.reduce((sum, meter) => sum + meter.lastReading, 0) / meters.length;
  }, [meters]);
  const chartData = range === "week" ? week : month;

  const submitMeter = (values: AddMeterValues) => {
    setAddOpen(false);
    toast.success(`${values.meterId} is ready for review. It was not saved in Phase 1.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Zone dashboard"
        subtitle="Monitor zone meters, consumption and alerts"
        actions={
          <>
            <button type="button" className="btn" onClick={() => setAddOpen(true)}>Add meter</button>
            <Link to="/zone/reports" className="btn btn-primary">Generate report</Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active meters" value={activeMeters} hint={`${meters.length} meters assigned to this zone`} loading={loading} tone="primary" to="/zone/meters" />
        <StatCard label="Average usage" value={`${averageUsage.toFixed(1)} kWh`} hint="Compared with zone average" trend={{ text: "3.4% below average", direction: "down", sentiment: "good" }} loading={loading} tone="info" />
        <StatCard label="Pending alerts" value={pendingAlerts} hint="Require zone administrator review" loading={loading} tone="warning" to="/zone/alerts" />
      </div>

      <ChartCard
        title="Zone consumption"
        subtitle={range === "week" ? "Daily energy usage" : "Weekly energy usage"}
        range={range}
        onRangeChange={setRange}
        rangeOptions={["week", "month"]}
        loading={loading}
        empty={chartData.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Line type="monotone" dataKey="value" name="This period" stroke="var(--color-primary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="comparison" name="Average" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <AddMeterModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={submitMeter} />
    </div>
  );
}

