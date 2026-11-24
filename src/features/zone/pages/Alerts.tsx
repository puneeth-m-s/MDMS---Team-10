import { useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge, { type BadgeStatus } from "../../auth/components/StatusBadge";
import { getZoneAlerts } from "../services/zoneService";
import type { AlertSeverity, AlertStatus, ZoneAlert } from "../types/zone";

export default function Alerts() {
  const [alerts, setAlerts] = useState<ZoneAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState<"all" | AlertSeverity>("all");
  const [status, setStatus] = useState<"all" | AlertStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getZoneAlerts().then(setAlerts).finally(() => setLoading(false));
  }, []);
  useEffect(() => setPage(1), [severity, status, search, pageSize]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alerts.filter((alert) =>
      (severity === "all" || alert.severity === severity) &&
      (status === "all" || alert.status === status) &&
      (!query || alert.title.toLowerCase().includes(query) || alert.meterId.toLowerCase().includes(query) || alert.owner.toLowerCase().includes(query)),
    );
  }, [alerts, severity, status, search]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<ZoneAlert>[] = [
    { key: "id", header: "Alert ID" },
    { key: "meterId", header: "Meter ID", sortable: true },
    { key: "owner", header: "Owner" },
    { key: "title", header: "Alert" },
    { key: "severity", header: "Severity", render: (row) => <StatusBadge status={row.severity as BadgeStatus} /> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Created", sortable: true },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Alerts" subtitle="Zone alerts requiring review" />
      <DataTable
        caption="Zone alerts"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search alerts…" }}
        toolbar={
          <>
            <select aria-label="Filter by severity" value={severity} onChange={(event) => setSeverity(event.target.value as "all" | AlertSeverity)}>
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value as "all" | AlertStatus)}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </>
        }
        pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
        emptyTitle="No alerts found"
        emptyMessage="Try changing the severity or status filter."
      />
    </div>
  );
}

