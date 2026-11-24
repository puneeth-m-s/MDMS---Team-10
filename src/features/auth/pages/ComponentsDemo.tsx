import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import type { BadgeStatus } from "../components/StatusBadge";
import ChartCard from "../components/ChartCard";
import type { TimeRange } from "../components/ChartCard";
import DataTable from "../components/DataTable";
import type { Column, RowAction, SortState } from "../components/DataTable";
import Tabs from "../components/Tabs";
import Modal, { ConfirmDialog } from "../components/Modal";
import EmptyState from "../components/EmptyState";
import Loader, { Skeleton } from "../components/Loader";
import {
  Input,
  PasswordInput,
  Select,
  Textarea,
  Toggle,
} from "../components/FormFields";
import { useToast } from "../components/Toast";

/* ---------- Fake data ---------- */
interface DemoMeter {
  id: string;
  owner: string;
  status: BadgeStatus;
  lastReading: number;
}

const OWNERS = [
  "Aarav Sharma",
  "Diya Patel",
  "Rohan Mehta",
  "Ananya Iyer",
  "Kabir Singh",
  "Meera Nair",
];

const METERS: DemoMeter[] = Array.from(
  { length: 23 },
  (_, i): DemoMeter => ({
    id: `MTR-${1001 + i}`,
    owner: OWNERS[i % OWNERS.length],
    status: i % 5 === 0 ? "deactivated" : i % 7 === 0 ? "pending" : "active",
    lastReading: 1200 + i * 37,
  }),
);

const ALL_STATUSES: BadgeStatus[] = [
  "active",
  "deactivated",
  "inactive",
  "pending",
  "paid",
  "overdue",
  "critical",
  "warning",
  "info",
  "open",
  "resolved",
  "success",
  "failed",
];

const BARS: Record<TimeRange, number[]> = {
  day: [20, 15, 12, 18, 40, 65, 80, 70, 55, 60, 75, 90],
  week: [55, 62, 48, 70, 66, 80, 58],
  month: [60, 72, 55, 80, 68],
  year: [40, 45, 52, 60, 66, 72, 80, 78, 70, 62, 55, 48],
};

const BoltIcon = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const COLUMNS: Column<DemoMeter>[] = [
  { key: "id", header: "Meter ID", sortable: true },
  { key: "owner", header: "Owner", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (m) => <StatusBadge status={m.status} />,
  },
  {
    key: "lastReading",
    header: "Last reading (kWh)",
    align: "right",
    sortable: true,
  },
];

export default function ComponentsDemo() {
  const toast = useToast();

  /* table state */
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Array<string | number>>([]);
  const [tableLoading, setTableLoading] = useState(false);

  /* chart state */
  const [range, setRange] = useState<TimeRange>("week");

  /* dialogs */
  const [formOpen, setFormOpen] = useState(false);
  const [confirmMeter, setConfirmMeter] = useState<DemoMeter | null>(null);
  const [meterId, setMeterId] = useState("");
  const [zone, setZone] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = term
      ? METERS.filter(
          (m) =>
            m.id.toLowerCase().includes(term) ||
            m.owner.toLowerCase().includes(term),
        )
      : [...METERS];
    if (sort) {
      list.sort((a, b) => {
        const av = a[sort.key as keyof DemoMeter];
        const bv = b[sort.key as keyof DemoMeter];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [q, sort]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const actions: RowAction<DemoMeter>[] = [
    { label: "View details", onClick: (m) => toast.info(`Opening ${m.id}…`) },
    { label: "Edit", onClick: () => setFormOpen(true) },
    {
      label: (m) => (m.status === "active" ? "Deactivate" : "Activate"),
      danger: true,
      onClick: (m) => setConfirmMeter(m),
    },
  ];

  const simulateLoading = () => {
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 1200);
  };

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    if (!/^MTR-\d{4}$/.test(meterId) || !zone) return;
    toast.success("Meter saved (demo only, nothing is stored)");
    setFormOpen(false);
    setMeterId("");
    setZone("");
  };

  const idError =
    meterId && !/^MTR-\d{4}$/.test(meterId)
      ? "Use the format MTR-1234"
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Component demo"
        subtitle="Temporary page for testing the shared components. Delete before submission."
        actions={
          <>
            <button
              className="btn"
              onClick={() => toast.success("Saved successfully")}
            >
              Success toast
            </button>
            <button
              className="btn"
              onClick={() => toast.error("Something failed")}
            >
              Error toast
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setFormOpen(true)}
            >
              Open modal
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <StatCard
          label="Active meters"
          value={248}
          icon={BoltIcon}
          to="/zone/meters"
        />
        <StatCard
          label="Average usage"
          value="312 kWh"
          tone="warning"
          icon={BoltIcon}
          trend={{
            text: "4.2% above average",
            direction: "up",
            sentiment: "bad",
          }}
        />
        <StatCard
          label="Pending alerts"
          value={7}
          tone="danger"
          hint="3 are critical"
          icon={BoltIcon}
        />
        <StatCard label="Loading card" value="" loading />
      </div>

      {/* Badges */}
      <section className="card">
        <h2 className="mb-3 text-[17px] font-bold">Status badges</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </section>

      {/* Chart card (plain bars; Recharts comes with the dashboards) */}
      <ChartCard
        title="Consumption overview"
        subtitle="Placeholder bars"
        range={range}
        onRangeChange={setRange}
      >
        <div className="flex h-full items-end gap-2">
          {BARS[range].map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-primary"
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
      </ChartCard>

      {/* Tabs: table + form fields */}
      <section className="card">
        <Tabs
          items={[
            {
              id: "table",
              label: "Data table",
              count: METERS.length,
              content: (
                <div className="flex flex-col gap-3">
                  <div>
                    <button className="btn" onClick={simulateLoading}>
                      Simulate loading
                    </button>
                  </div>
                  <DataTable<DemoMeter>
                    caption="Demo meters"
                    columns={COLUMNS}
                    rows={pageRows}
                    rowKey={(m) => m.id}
                    loading={tableLoading}
                    search={{
                      value: q,
                      onChange: (v) => {
                        setQ(v);
                        setPage(1);
                      },
                      placeholder: "Search meters…",
                    }}
                    sort={sort}
                    onSortChange={setSort}
                    selectable
                    selectedKeys={selected}
                    onSelectionChange={setSelected}
                    rowActions={actions}
                    pagination={{
                      page,
                      pageSize,
                      total: filtered.length,
                      onPageChange: setPage,
                      onPageSizeChange: (s) => {
                        setPageSize(s);
                        setPage(1);
                      },
                    }}
                    emptyMessage="No meters match your search."
                  />
                </div>
              ),
            },
            {
              id: "fields",
              label: "Form fields",
              content: (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Full name"
                    required
                    placeholder="Aarav Sharma"
                    hint="As on your bill"
                  />
                  <Input
                    label="Email"
                    defaultValue="abc"
                    error="Enter a valid email address"
                  />
                  <PasswordInput label="Password" placeholder="••••••••" />
                  <Select
                    label="Zone"
                    placeholder="Select a zone"
                    options={[
                      { value: "north", label: "North" },
                      { value: "south", label: "South" },
                    ]}
                  />
                  <div className="sm:col-span-2">
                    <Textarea
                      label="Description"
                      placeholder="Optional notes"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Toggle
                      label="Email alerts"
                      description="Get an email when a bill is generated"
                      defaultChecked
                    />
                    <Toggle
                      label="SMS alerts"
                      description="Get an SMS when consumption is high"
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* Loader / skeleton / empty */}
      <div className="grid gap-4 md:grid-cols-3">
        <section className="card flex flex-col items-center gap-3">
          <Loader showLabel label="Loading data…" />
        </section>
        <section className="card flex flex-col gap-2">
          <Skeleton height={14} width="60%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
        </section>
        <section className="card">
          <EmptyState title="No alerts" message="You're all caught up." />
        </section>
      </div>

      {/* Modal with a validated form */}
      <Modal
        open={formOpen}
        title="Add meter"
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" form="demo-form" className="btn btn-primary">
              Save
            </button>
          </>
        }
      >
        <form
          id="demo-form"
          onSubmit={submitForm}
          className="grid gap-4"
          noValidate
        >
          <Input
            label="Meter ID"
            required
            value={meterId}
            onChange={(e) => setMeterId(e.target.value)}
            hint="Format: MTR-1234"
            error={idError}
          />
          <Select
            label="Zone"
            required
            placeholder="Select a zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            options={[
              { value: "north", label: "North" },
              { value: "south", label: "South" },
            ]}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmMeter !== null}
        tone="danger"
        title={`${confirmMeter?.status === "active" ? "Deactivate" : "Activate"} meter?`}
        message={`This changes the status of ${confirmMeter?.id ?? "the meter"}. (Demo only, nothing is stored.)`}
        confirmLabel={
          confirmMeter?.status === "active" ? "Deactivate" : "Activate"
        }
        onCancel={() => setConfirmMeter(null)}
        onConfirm={() => {
          toast.warning(`${confirmMeter?.id} status change confirmed (demo)`);
          setConfirmMeter(null);
        }}
      />
    </div>
  );
}
