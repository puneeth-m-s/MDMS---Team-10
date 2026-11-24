import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column, type RowAction } from "../../auth/components/DataTable";
import { ConfirmDialog } from "../../auth/components/Modal";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { useToast } from "../../auth/components/Toast";
import AddZoneModal from "../components/AddZoneModal";
import { getEnterpriseZones } from "../services/enterpriseService";
import type { AddZoneValues, EnterpriseZone } from "../types/enterprise";

export default function ZoneManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [zones, setZones] = useState<EnterpriseZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<EnterpriseZone | null>(null);

  useEffect(() => {
    getEnterpriseZones().then(setZones).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return zones.filter((zone) =>
      (status === "all" || zone.status === status) &&
      (!query || zone.zoneId.toLowerCase().includes(query) || zone.name.toLowerCase().includes(query) || zone.assignedAdmin.toLowerCase().includes(query)),
    );
  }, [zones, search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: Column<EnterpriseZone>[] = [
    { key: "zoneId", header: "Zone ID", sortable: true },
    { key: "name", header: "Zone name", sortable: true },
    { key: "assignedAdmin", header: "Assigned admin", sortable: true },
    { key: "totalMeters", header: "Total meters", align: "center" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];
  const actions: RowAction<EnterpriseZone>[] = [
    { label: "View", onClick: (row) => navigate(`/enterprise/zones/${row.zoneId}`) },
    { label: "Edit", onClick: (row) => toast.info(`Edit mode for ${row.name}; changes are not persisted in Phase 1.`) },
    { label: (row) => row.status === "active" ? "Deactivate" : "Activate", onClick: setSelected },
  ];

  const submitZone = (values: AddZoneValues) => {
    setAddOpen(false);
    toast.success(`${values.name} was validated. Submission is read-only in Phase 1.`);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Zone management" subtitle="Zones and assigned administrators" actions={<button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>Add zone</button>} />
      <DataTable
        caption="Enterprise zones"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search zone or admin…" }}
        toolbar={
          <select aria-label="Filter by zone status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="deactivated">Deactivated</option>
          </select>
        }
        rowActions={actions}
        pagination={{ page: currentPage, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
        emptyTitle="No zones found"
        emptyMessage="Try changing the search or status filter."
      />
      <AddZoneModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={submitZone} />
      <ConfirmDialog
        open={!!selected}
        title={selected?.status === "active" ? "Deactivate zone?" : "Activate zone?"}
        message={`The status action for ${selected?.name ?? "this zone"} will not persist in Phase 1.`}
        confirmLabel={selected?.status === "active" ? "Deactivate" : "Activate"}
        tone={selected?.status === "active" ? "danger" : "primary"}
        onCancel={() => setSelected(null)}
        onConfirm={() => {
          if (selected) toast.success(`${selected.name} status action acknowledged. No data was changed.`);
          setSelected(null);
        }}
      />
    </div>
  );
}

