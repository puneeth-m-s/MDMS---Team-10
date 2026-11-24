import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { useToast } from "../../auth/components/Toast";
import { getZoneMeters, getZoneReportSummary } from "../services/zoneService";
import type { Meter, ReportSummaryRow } from "../types/zone";

const chartData = [
  { label: "Nov 18", value: 84 },
  { label: "Nov 19", value: 91 },
  { label: "Nov 20", value: 78 },
  { label: "Nov 21", value: 106 },
  { label: "Nov 22", value: 98 },
  { label: "Nov 23", value: 112 },
  { label: "Nov 24", value: 104 },
];

export default function Reports() {
  const toast = useToast();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [summary, setSummary] = useState<ReportSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("2026-11-18");
  const [to, setTo] = useState("2026-11-24");
  const [meterId, setMeterId] = useState("all");

  useEffect(() => {
    Promise.all([getZoneMeters(), getZoneReportSummary()])
      .then(([meterRows, reportRows]) => {
        setMeters(meterRows);
        setSummary(reportRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () => meterId === "all" ? summary : summary.filter((row) => row.meterId === meterId),
    [summary, meterId],
  );

  const columns: Column<ReportSummaryRow>[] = [
    { key: "meterId", header: "Meter ID", sortable: true },
    { key: "owner", header: "Owner", sortable: true },
    { key: "consumption", header: "Consumption", align: "right", render: (row) => `${row.consumption.toFixed(1)} kWh` },
    { key: "cost", header: "Estimated cost", align: "right", render: (row) => `₹${row.cost.toLocaleString()}` },
    { key: "changePercent", header: "Change", align: "right", render: (row) => `${row.changePercent > 0 ? "+" : ""}${row.changePercent.toFixed(1)}%` },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports & analytics"
        subtitle="Consumption and cost reporting"
        actions={<button type="button" className="btn btn-primary" onClick={() => toast.success("Report generation preview is not persisted in Phase 1.")}>Generate report</button>}
      />

      <section className="card grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          From
          <input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="h-11 rounded-control border border-line bg-surface px-3" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          To
          <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="h-11 rounded-control border border-line bg-surface px-3" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Meter
          <select value={meterId} onChange={(event) => setMeterId(event.target.value)} className="h-11 rounded-control border border-line bg-surface px-3">
            <option value="all">All meters</option>
            {meters.map((meter) => <option key={meter.id} value={meter.meterId}>{meter.meterId}</option>)}
          </select>
        </label>
      </section>

      <ChartCard title="Energy consumption" subtitle={`${from} to ${to}`} loading={loading} height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Line type="monotone" dataKey="value" name="kWh" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        caption="Consumption summary"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.meterId}
        loading={loading}
        emptyTitle="No report data"
        emptyMessage="Try a different meter or date range."
      />
    </div>
  );
}

