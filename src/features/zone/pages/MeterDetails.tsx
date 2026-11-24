import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import DataTable, { type Column } from "../../auth/components/DataTable";
import EmptyState from "../../auth/components/EmptyState";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { getZoneMeters, getZoneReadings } from "../services/zoneService";
import type { Meter, MeterReading } from "../types/zone";

export default function MeterDetails() {
  const { meterId } = useParams();
  const [meter, setMeter] = useState<Meter | null>(null);
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getZoneMeters(), getZoneReadings(meterId ?? "")])
      .then(([meters, readingRows]) => {
        setMeter(meters.find((item) => item.meterId === meterId) ?? null);
        setReadings(readingRows);
      })
      .finally(() => setLoading(false));
  }, [meterId]);

  const columns: Column<MeterReading>[] = [
    { key: "readingDate", header: "Date", sortable: true },
    { key: "consumption", header: "Consumption", align: "right", render: (row) => `${row.consumption.toFixed(1)} kWh` },
    { key: "reading", header: "Meter reading", align: "right", render: (row) => `${row.reading.toLocaleString()} kWh` },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  if (!loading && !meter) {
    return <EmptyState title="Meter not found" message="No meter in this zone matches the requested meter ID." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={meter?.meterId ?? "Meter details"}
        subtitle={meter ? `Customer: ${meter.owner}` : "Loading meter"}
        back={{ to: "/zone/meters", label: "Back to meter management" }}
      />

      {meter && (
        <section className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Owner" value={meter.owner} />
          <Detail label="Address" value={meter.address} />
          <Detail label="Status" value={<StatusBadge status={meter.status} />} />
          <Detail label="Installed date" value={new Date(`${meter.installedDate}T00:00:00`).toLocaleDateString()} />
          <Detail label="Tariff category" value={meter.tariffCategory} />
          <Detail label="Last reading" value={`${meter.lastReading.toLocaleString()} kWh`} />
        </section>
      )}

      <ChartCard title="Meter usage" subtitle="Recent daily consumption" loading={loading} empty={readings.length === 0} height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...readings].reverse()} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="readingDate" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Line type="monotone" dataKey="consumption" name="kWh" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        caption="Recent meter readings"
        columns={columns}
        rows={readings}
        rowKey={(row) => row.id}
        loading={loading}
        pagination={undefined}
        emptyTitle="No readings available"
        emptyMessage="This meter has no recent readings."
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

