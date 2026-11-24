import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DataTable, { type Column } from "../../auth/components/DataTable";
import EmptyState from "../../auth/components/EmptyState";
import PageHeader from "../../auth/components/PageHeader";
import StatCard from "../../auth/components/StatCard";
import StatusBadge from "../../auth/components/StatusBadge";
import Tabs from "../../auth/components/Tabs";
import { getEnterpriseMeters, getEnterpriseUsers, getEnterpriseZones } from "../services/enterpriseService";
import type { EnterpriseMeter, EnterpriseUser, EnterpriseZone } from "../types/enterprise";

export default function ZoneDetails() {
  const { zoneId } = useParams();
  const [zone, setZone] = useState<EnterpriseZone | null>(null);
  const [meters, setMeters] = useState<EnterpriseMeter[]>([]);
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getEnterpriseZones(), getEnterpriseMeters(), getEnterpriseUsers()])
      .then(([zones, meterRows, userRows]) => {
        setZone(zones.find((item) => item.zoneId === zoneId) ?? null);
        setMeters(meterRows.filter((meter) => meter.zoneId === zoneId));
        setUsers(userRows.filter((user) => user.zoneId === zoneId));
      })
      .finally(() => setLoading(false));
  }, [zoneId]);

  if (!loading && !zone) return <EmptyState title="Zone not found" message="No enterprise zone matches this identifier." />;

  const meterColumns: Column<EnterpriseMeter>[] = [
    { key: "meterId", header: "Meter ID" },
    { key: "owner", header: "Owner" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "lastReading", header: "Last reading", align: "right", render: (row) => `${row.lastReading.toLocaleString()} kWh` },
  ];
  const userColumns: Column<EnterpriseUser>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={zone?.name ?? "Zone details"} subtitle={zone?.location} back={{ to: "/enterprise/zones", label: "Back to zones" }} />
      {zone && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Meters" value={meters.length} loading={loading} />
            <StatCard label="Zone users" value={users.length} loading={loading} tone="info" />
            <StatCard label="Status" value={zone.status === "active" ? "Active" : "Deactivated"} loading={loading} tone={zone.status === "active" ? "primary" : "warning"} />
          </div>
          <section className="card grid gap-4 sm:grid-cols-2">
            <Detail label="Zone ID" value={zone.zoneId} />
            <Detail label="Assigned admin" value={zone.assignedAdmin} />
            <Detail label="Pincode" value={zone.pincode} />
            <Detail label="Description" value={zone.description} />
          </section>
        </>
      )}
      <Tabs
        label="Zone details"
        items={[
          { id: "meters", label: "Meters", count: meters.length, content: <DataTable caption="Zone meters" columns={meterColumns} rows={meters} rowKey={(row) => row.id} loading={loading} /> },
          { id: "users", label: "Users", count: users.length, content: <DataTable caption="Zone users" columns={userColumns} rows={users} rowKey={(row) => row.id} loading={loading} /> },
        ]}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
