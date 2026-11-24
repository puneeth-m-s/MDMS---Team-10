import { useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { getEnterpriseAuditLogs } from "../services/enterpriseService";
import type { AuditLog } from "../types/enterprise";

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getEnterpriseAuditLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  const users = useMemo(() => [...new Set(logs.map((log) => log.user))], [logs]);
  const filtered = useMemo(() => logs.filter((log) =>
    (user === "all" || log.user === user) &&
    (status === "all" || log.status === status) &&
    (!date || log.timestamp.startsWith(date)),
  ), [logs, user, status, date]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<AuditLog>[] = [
    { key: "id", header: "Log ID", sortable: true },
    { key: "timestamp", header: "Timestamp", sortable: true },
    { key: "user", header: "User", sortable: true },
    { key: "action", header: "Action" },
    { key: "resource", header: "Resource" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Audit logs" subtitle="Enterprise activity history" />
      <DataTable
        caption="Enterprise audit logs"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        toolbar={
          <>
            <select aria-label="Filter by user" value={user} onChange={(event) => setUser(event.target.value)}>
              <option value="all">All users</option>
              {users.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
            <input type="date" aria-label="Filter by date" value={date} onChange={(event) => setDate(event.target.value)} className="h-[42px] rounded-control border border-line bg-surface px-2.5" />
          </>
        }
        pagination={{ page: currentPage, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
      />
    </div>
  );
}

