import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "../../auth/components/ChartCard";
import DataTable, { type Column } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import Tabs from "../../auth/components/Tabs";
import { useToast } from "../../auth/components/Toast";
import { getEnterpriseUsers, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseUser, EnterpriseZone } from "../types/enterprise";

export default function UserManagement() {
  const toast = useToast();
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("admins");
  const [search, setSearch] = useState("");
  const [zoneId, setZoneId] = useState("all");
  const [year, setYear] = useState("2026");

  useEffect(() => {
    Promise.all([getEnterpriseUsers(), getEnterpriseZones()])
      .then(([userRows, zoneRows]) => {
        setUsers(userRows);
        setZones(zoneRows);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) =>
      (tab === "admins" ? user.role === "Zone Admin" : user.role === "Consumer") &&
      (zoneId === "all" || user.zoneId === zoneId) &&
      (!query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.id.toLowerCase().includes(query)),
    );
  }, [users, tab, search, zoneId]);

  const active = filtered.filter((user) => user.status === "active").length;
  const deactivated = filtered.filter((user) => user.status === "deactivated").length;
  const chartData = [
    { name: "Active", value: active, color: "var(--color-primary)" },
    { name: "Deactivated", value: deactivated, color: "var(--color-danger)" },
  ];

  const columns: Column<EnterpriseUser>[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "zoneId", header: "Zone" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const table = (
    <DataTable
      caption={`${tab} enterprise users`}
      columns={columns}
      rows={filtered}
      rowKey={(row) => row.id}
      loading={loading}
      search={{ value: search, onChange: setSearch, placeholder: "Search users…" }}
      toolbar={
        <select aria-label="Filter by zone" value={zoneId} onChange={(event) => setZoneId(event.target.value)}>
          <option value="all">All zones</option>
          {zones.map((zone) => <option key={zone.id} value={zone.zoneId}>{zone.name}</option>)}
        </select>
      }
      rowActions={[
        { label: "View user", onClick: (row) => toast.info(`Viewing ${row.name}; customer management remains with Zone Admin.`) },
        { label: "Deactivate / activate", onClick: (row) => toast.success(`${row.name} status action acknowledged. No data was changed.`) },
      ]}
    />
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="User & role management"
        subtitle="Enterprise view of administrators and consumers"
        actions={
          <select aria-label="User chart year" value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-control border border-line bg-surface px-3">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        }
      />
      <ChartCard title={`User status distribution · ${year}`} subtitle="Active and deactivated users" loading={loading} empty={filtered.length === 0} height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
              {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-line)", borderRadius: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <Tabs
        label="User role"
        value={tab}
        onChange={(id) => setTab(id)}
        items={[
          { id: "admins", label: "Admins", count: users.filter((user) => user.role === "Zone Admin").length, content: table },
          { id: "consumers", label: "Consumers", count: users.filter((user) => user.role === "Consumer").length, content: table },
        ]}
      />
    </div>
  );
}
