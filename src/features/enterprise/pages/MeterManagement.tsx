import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { useToast } from "../../auth/components/Toast";
import { getEnterpriseMeters, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseMeter, EnterpriseZone } from "../types/enterprise";

export default function MeterManagement() {
  const toast = useToast();
  const [meters, setMeters] = useState<EnterpriseMeter[]>([]);
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zoneId, setZoneId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    Promise.all([getEnterpriseMeters(), getEnterpriseZones()])
      .then(([meterRows, zoneRows]) => {
        setMeters(meterRows);
        setZones(zoneRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return meters.filter((meter) =>
      (zoneId === "all" || meter.zoneId === zoneId) &&
      (status === "all" || meter.status === status) &&
      (!query || meter.meterId.toLowerCase().includes(query) || meter.owner.toLowerCase().includes(query)),
    );
  }, [meters, search, zoneId, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const chartData = zones.map((zone) => {
    const zoneMeters = meters.filter((meter) => meter.zoneId === zone.zoneId);
    return {
      zone: zone.name.replace(" Zone", ""),
      consumption: zoneMeters.reduce((sum, meter) => sum + meter.lastReading, 0),
    };
  });

  const columns: Column<EnterpriseMeter>[] = [
    { key: "meterId", header: "Meter ID", sortable: true },
    { key: "zoneId", header: "Zone", sortable: true },
    { key: "owner", header: "Owner", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "lastReading", header: "Last reading", align: "right", render: (row) => `${row.lastReading.toLocaleString()} kWh` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Meter management" subtitle="Enterprise-wide meter data" />
      <ChartCard title="Consumption by zone" subtitle="Current reading total (kWh)" loading={loading} height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis dataKey="zone" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
            <Bar dataKey="consumption" name="kWh" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <DataTable
        caption="Enterprise meters"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search meter or owner…" }}
        toolbar={
          <>
            <select aria-label="Filter by zone" value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
              <option value="all">All zones</option>
              {zones.map((zone) => <option key={zone.id} value={zone.zoneId}>{zone.name}</option>)}
            </select>
            <select aria-label="Filter by meter status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </>
        }
        rowActions={[
          { label: "View details", onClick: (row) => toast.info(`Meter ${row.meterId} belongs to ${row.zoneId}.`) },
          { label: "Edit", onClick: (row) => toast.info(`Edit mode for ${row.meterId}; changes are not persisted.`) },
          { label: (row) => row.status === "active" ? "Deactivate" : "Activate", onClick: (row) => toast.success(`${row.meterId} status action acknowledged. No data was changed.`) },
        ]}
        pagination={{ page: currentPage, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
}

