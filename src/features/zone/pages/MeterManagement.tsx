import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column, type RowAction } from "../../auth/components/DataTable";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { ConfirmDialog } from "../../auth/components/Modal";
import { useToast } from "../../auth/components/Toast";
import AddMeterModal from "../components/AddMeterModal";
import { getZoneMeters } from "../services/zoneService";
import type { AddMeterValues, Meter } from "../types/zone";

export default function MeterManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);

  useEffect(() => {
    getZoneMeters().then(setMeters).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return meters.filter((meter) =>
      (status === "all" || meter.status === status) &&
      (!query ||
        meter.meterId.toLowerCase().includes(query) ||
        meter.owner.toLowerCase().includes(query)),
    );
  }, [meters, search, status]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, status, pageSize]);

  const submitMeter = (values: AddMeterValues) => {
    setAddOpen(false);
    toast.success(`${values.meterId} was validated. Submission is read-only in Phase 1.`);
  };

  const columns: Column<Meter>[] = [
    { key: "meterId", header: "Meter ID", sortable: true },
    { key: "owner", header: "Owner", sortable: true },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "lastReading", header: "Last reading", align: "right", render: (row) => `${row.lastReading.toLocaleString()} kWh` },
  ];

  const actions: RowAction<Meter>[] = [
    { label: "View details", onClick: (row) => navigate(`/zone/meters/${row.meterId}`) },
    { label: "Edit", onClick: (row) => toast.info(`Edit mode for ${row.meterId}; changes are not persisted in Phase 1.`) },
    {
      label: (row) => row.status === "active" ? "Deactivate" : "Activate",
      onClick: (row) => setSelectedMeter(row),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Meter management"
        subtitle="Meters managed in this zone"
        actions={<button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>Add meter</button>}
      />

      <DataTable
        caption="Zone meters"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search meter or owner…" }}
        toolbar={
          <select aria-label="Filter by meter status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deactivated">Deactivated</option>
          </select>
        }
        rowActions={actions}
        pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
        emptyTitle="No meters found"
        emptyMessage="Try changing the search or status filter."
      />

      <AddMeterModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={submitMeter} />
      <ConfirmDialog
        open={!!selectedMeter}
        title={selectedMeter?.status === "active" ? "Deactivate meter?" : "Activate meter?"}
        message={`The status action for ${selectedMeter?.meterId ?? "this meter"} will not persist in Phase 1.`}
        confirmLabel={selectedMeter?.status === "active" ? "Deactivate" : "Activate"}
        tone={selectedMeter?.status === "active" ? "danger" : "primary"}
        onCancel={() => setSelectedMeter(null)}
        onConfirm={() => {
          if (selectedMeter) toast.success(`${selectedMeter.meterId} status action acknowledged. No data was changed.`);
          setSelectedMeter(null);
        }}
      />
    </div>
  );
}
