import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import DataTable, { type Column, type RowAction } from "../../auth/components/DataTable";
import Modal from "../../auth/components/Modal";
import PageHeader from "../../auth/components/PageHeader";
import StatusBadge from "../../auth/components/StatusBadge";
import { getZoneCustomers, getZoneMeters } from "../services/zoneService";
import type { Customer, Meter } from "../types/zone";

export default function UserManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Customer | null>(null);

  useEffect(() => {
    Promise.all([getZoneCustomers(), getZoneMeters()])
      .then(([customerRows, meterRows]) => {
        setCustomers(customerRows);
        setMeters(meterRows);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => setPage(1), [search, pageSize]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) =>
      !query ||
      customer.id.toLowerCase().includes(query) ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query),
    );
  }, [customers, search]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Customer>[] = [
    { key: "id", header: "Customer ID", sortable: true },
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "meterIds", header: "Meters", align: "center", render: (row) => row.meterIds.length },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];
  const actions: RowAction<Customer>[] = [
    { label: "View customer details", onClick: setSelected },
  ];

  const associatedMeters = selected ? meters.filter((meter) => selected.meterIds.includes(meter.meterId)) : [];

  return (
    <div className="space-y-5">
      <PageHeader title="User management" subtitle="Customers and meters in this zone" />
      <DataTable
        caption="Zone customers"
        columns={columns}
        rows={paged}
        rowKey={(row) => row.id}
        loading={loading}
        search={{ value: search, onChange: setSearch, placeholder: "Search name, email or phone…" }}
        rowActions={actions}
        pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: setPageSize }}
        emptyTitle="No customers found"
        emptyMessage="Try changing the customer search."
      />

      <Modal open={!!selected} title="Customer details" onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Customer ID" value={selected.id} />
              <Detail label="Name" value={selected.name} />
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Address" value={selected.address} />
              <Detail label="Status" value={<StatusBadge status={selected.status} />} />
            </div>
            <div>
              <h3 className="mb-2 font-bold">Associated meters</h3>
              {associatedMeters.length === 0 ? (
                <p className="text-muted">No associated meters found.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {associatedMeters.map((meter) => (
                    <li key={meter.id} className="flex items-center justify-between rounded-control border border-line p-3">
                      <span className="font-semibold">{meter.meterId}</span>
                      <StatusBadge status={meter.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
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
