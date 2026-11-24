import { useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge, { type BadgeStatus } from "../../auth/components/StatusBadge";
import { getEnterpriseAlerts, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseAlert, EnterpriseZone } from "../types/enterprise";

export default function Alerts() {
  const [alerts, setAlerts] = useState<EnterpriseAlert[]>([]);
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [zoneId, setZoneId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    Promise.all([getEnterpriseAlerts(), getEnterpriseZones()])
      .then(([alertRows, zoneRows]) => {
        setAlerts(alertRows);
        setZones(zoneRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alerts.filter((alert) =>
      (severity === "all" || alert.severity === severity) &&
      (status === "all" || alert.status === status) &&
      (zoneId === "all" || alert.zoneId === zoneId) &&
      (!query || alert.title.toLowerCase().includes(query) || alert.meterId.toLowerCase().includes(query)),
    );
  }, [alerts, search, severity, status, zoneId]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<EnterpriseAlert>[] = [
    { key: "id", header: "Alert ID" },
    { key: "zoneId", header: "Zone", sortable: true },
    { key: "meterId", header: "Meter ID" },
    { key: "owner", header: "Owner" },
    { key: "title", header: "Alert" },
    { key: "severity", header: "Severity", render: (row) => <StatusBadge status={row.severity as BadgeStatus} /> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Enterprise alerts" subtitle="Alerts from every zone" />
      <DataTable
        caption="Enterprise alerts"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search alert or meter…" }}
        toolbar={
          <>
            <select aria-label="Filter by severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <select aria-label="Filter by zone" value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
              <option value="all">All zones</option>
              {zones.map((zone) => <option key={zone.id} value={zone.zoneId}>{zone.name}</option>)}
            </select>
          </>
        }
        pagination={{ page: currentPage, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
}

