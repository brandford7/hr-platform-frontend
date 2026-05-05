import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { Plus, CheckCheck, XCircle, Printer, X, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  useLeaveRequests,
  useLeaveBalances,
  useLeaveTypes,
  useReviewLeave,
  useBulkReviewLeave,
  useCancelLeave,
} from "@/features/leave/hooks/useLeave";
import { useAuthStore } from "@/store/auth.store";
import { departmentService } from "@/services/department.service";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeaveRequest, LeaveStatus } from "@/types/api.types";
import { RequestLeaveDialog } from "@/features/leave/components/LeaveRequestDialog";

// ── Printable Leave History ───────────────────────────────────────────────────

const PrintableHistory = ({ requests }: { requests: LeaveRequest[] }) => (
  <div className="p-10 hidden print:block">
    <h1 className="text-2xl font-bold mb-1">Leave History Report</h1>
    <p className="text-gray-500 text-sm mb-8">
      Generated on {format(new Date(), "MMMM d, yyyy, h:mm a")}
    </p>
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-300">
          {[
            "Employee",
            "Department",
            "Leave Type",
            "Start",
            "End",
            "Days",
            "Resumption",
            "Status",
          ].map((h) => (
            <th key={h} className="text-left py-2 pr-4 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => (
          <tr key={r.id} className="border-b border-gray-100">
            <td className="py-2 pr-4">
              {r.employee.firstName} {r.employee.lastName}
            </td>
            <td className="py-2 pr-4">{r.employee.department?.name ?? "—"}</td>
            <td className="py-2 pr-4">{r.leaveType.name}</td>
            <td className="py-2 pr-4">
              {format(new Date(r.startDate), "MMM d, yyyy")}
            </td>
            <td className="py-2 pr-4">
              {format(new Date(r.endDate), "MMM d, yyyy")}
            </td>
            <td className="py-2 pr-4">{r.totalDays}</td>
            <td className="py-2 pr-4">
              {r.resumptionDate
                ? format(new Date(r.resumptionDate), "MMM d, yyyy")
                : "—"}
            </td>
            <td className="py-2">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export function LeavePage() {
  const { user } = useAuthStore();
  const isAdminOrManager = user?.roleName !== "EMPLOYEE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "">("");
  const [deptFilter, setDeptFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    action: "APPROVED" | "REJECTED";
  } | null>(null);
  const [bulkAction, setBulkAction] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const resetPage = () => setPage(1);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: isAdminOrManager,
  });

  const { data: leaveTypes } = useLeaveTypes();
  const { data: balances } = useLeaveBalances();

  const { data, isLoading, isError, error, refetch } = useLeaveRequests({
    page,
    limit: 10,
    status: statusFilter || undefined,
    departmentId: deptFilter || undefined,
    leaveTypeId: leaveTypeFilter || undefined,
    search: search || undefined,
  });

  const reviewLeave = useReviewLeave();
  const bulkReview = useBulkReviewLeave();
  const cancelLeave = useCancelLeave();

  const allRequests = data?.data ?? [];
  const activeFilters = [deptFilter, leaveTypeFilter].filter(Boolean).length;

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === allRequests.length
        ? []
        : allRequests.map((r) => r.id),
    );
  const clearFilters = () => {
    setDeptFilter("");
    setLeaveTypeFilter("");
    resetPage();
  };

  const columns = [
    // Bulk select checkbox — admin/manager only
    ...(isAdminOrManager
      ? [
          {
            key: "select",
            label: "",
            className: "w-10",
            render: (row: LeaveRequest) => (
              <Checkbox
                checked={selectedIds.includes(row.id)}
                onCheckedChange={() => toggleSelect(row.id)}
                aria-label="Select row"
              />
            ),
          },
        ]
      : []),
    {
      key: "employee",
      label: "Employee",
      render: (row: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
            {row.employee.firstName[0]}
            {row.employee.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              {row.employee.firstName} {row.employee.lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.employee.department?.name ?? "No department"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "leaveType",
      label: "Type",
      render: (row: LeaveRequest) => (
        <Badge
          variant="outline"
          className="text-xs"
          style={{
            borderColor: row.leaveType.colorHex,
            color: row.leaveType.colorHex,
          }}
        >
          {row.leaveType.name}
        </Badge>
      ),
    },
    {
      key: "period",
      label: "Period",
      render: (row: LeaveRequest) => (
        <div className="text-xs space-y-0.5">
          <p>
            {format(new Date(row.startDate), "MMM d")} –{" "}
            {format(new Date(row.endDate), "MMM d, yyyy")}
          </p>
          <p className="text-muted-foreground">
            {row.totalDays} business day{row.totalDays !== 1 ? "s" : ""}
          </p>
        </div>
      ),
    },
    {
      key: "resumption",
      label: "Resumption",
      render: (row: LeaveRequest) =>
        row.resumptionDate ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={11} />
            {format(new Date(row.resumptionDate), "MMM d, yyyy")}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: LeaveRequest) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      label: "",
      className: "w-40",
      render: (row: LeaveRequest) => (
        <div className="flex items-center gap-1 flex-wrap">
          {isAdminOrManager && row.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={() =>
                  setReviewTarget({ id: row.id, action: "APPROVED" })
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                onClick={() =>
                  setReviewTarget({ id: row.id, action: "REJECTED" })
                }
              >
                Reject
              </Button>
            </>
          )}
          {row.status === "PENDING" && row.employee.id === user?.employeeId && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs px-2 text-muted-foreground"
              onClick={() => cancelLeave.mutate(row.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <ErrorState
        title="Failed to load leave requests"
        message={(error as { message?: string })?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.pagination.total ?? 0} total requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePrint()}>
            <Printer size={14} className="mr-2" /> Print History
          </Button>
          <Button onClick={() => setRequestOpen(true)}>
            <Plus size={16} className="mr-2" /> Request Leave
          </Button>
        </div>
      </div>

      {/* Leave balance cards — always visible */}
      {balances && balances.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {balances.map((b) => (
            <Card key={b.leaveType.id} className="overflow-hidden">
              <div
                className="h-1"
                style={{ background: b.leaveType.colorHex }}
              />
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground truncate">
                  {b.leaveType.name}
                </p>
                <p className="text-xl font-bold">{b.availableDays}</p>
                <p className="text-[11px] text-muted-foreground">
                  of {b.totalDays} left
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters + bulk actions row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status tabs */}
        <Tabs
          value={statusFilter || "all"}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : (v as LeaveStatus));
            resetPage();
            setSelectedIds([]);
          }}
        >
          <TabsList className="h-8">
            {(
              ["all", "PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const
            ).map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="text-xs px-3 h-6 capitalize"
              >
                {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Department filter — admin/manager only */}
        {isAdminOrManager && (
          <Select
            value={deptFilter}
            onValueChange={(v) => {
              setDeptFilter(v === "_all" ? "" : v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All departments</SelectItem>
              {departments?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Leave type filter */}
        <Select
          value={leaveTypeFilter}
          onValueChange={(v) => {
            setLeaveTypeFilter(v === "_all" ? "" : v);
            resetPage();
          }}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="All leave types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All leave types</SelectItem>
            {leaveTypes?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={clearFilters}
          >
            <X size={12} /> Clear
            <Badge className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
              {activeFilters}
            </Badge>
          </Button>
        )}

        {/* Bulk actions — show when rows selected */}
        {isAdminOrManager && selectedIds.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-emerald-600 border-emerald-200"
              onClick={() => setBulkAction("APPROVED")}
            >
              <CheckCheck size={13} className="mr-1" /> Approve All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs text-destructive border-destructive/20"
              onClick={() => setBulkAction("REJECTED")}
            >
              <XCircle size={13} className="mr-1" /> Reject All
            </Button>
          </div>
        )}

        {/* Select all toggle */}
        {isAdminOrManager && allRequests.length > 0 && (
          <div className="flex items-center gap-1.5 ml-1">
            <Checkbox
              checked={
                selectedIds.length === allRequests.length &&
                allRequests.length > 0
              }
              onCheckedChange={toggleAll}
              id="toggle-all"
            />
            <label
              htmlFor="toggle-all"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Select all
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={allRequests}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetPage();
        }}
        searchPlaceholder={
          isAdminOrManager ? "Search by employee name…" : "Search…"
        }
        emptyMessage="No leave requests match your filters"
        pagination={
          data
            ? {
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
                hasNext: data.pagination.hasNext,
                hasPrev: data.pagination.hasPrev,
                total: data.pagination.total,
                limit: data.pagination.limit,
                onNext: () => setPage((p) => p + 1),
                onPrev: () => setPage((p) => p - 1),
              }
            : undefined
        }
      />

      {/* Hidden print region */}
      <div ref={printRef}>
        <PrintableHistory requests={allRequests} />
      </div>

      {/* Dialogs */}
      <RequestLeaveDialog open={requestOpen} onOpenChange={setRequestOpen} />

      <ConfirmDialog
        open={!!reviewTarget}
        onOpenChange={(o) => !o && setReviewTarget(null)}
        title={
          reviewTarget?.action === "APPROVED"
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        description={`Are you sure you want to ${reviewTarget?.action?.toLowerCase()} this leave request?`}
        confirmLabel={
          reviewTarget?.action === "APPROVED" ? "Approve" : "Reject"
        }
        variant={
          reviewTarget?.action === "REJECTED" ? "destructive" : "default"
        }
        isLoading={reviewLeave.isPending}
        onConfirm={() => {
          if (reviewTarget) {
            reviewLeave.mutate(
              { id: reviewTarget.id, input: { status: reviewTarget.action } },
              { onSettled: () => setReviewTarget(null) },
            );
          }
        }}
      />

      <ConfirmDialog
        open={!!bulkAction}
        onOpenChange={(o) => !o && setBulkAction(null)}
        title={`Bulk ${bulkAction === "APPROVED" ? "Approve" : "Reject"} Leave`}
        description={`${bulkAction === "APPROVED" ? "Approve" : "Reject"} ${selectedIds.length} selected request(s)?`}
        confirmLabel={bulkAction === "APPROVED" ? "Approve All" : "Reject All"}
        variant={bulkAction === "REJECTED" ? "destructive" : "default"}
        isLoading={bulkReview.isPending}
        onConfirm={() => {
          if (bulkAction) {
            bulkReview.mutate(
              { ids: selectedIds, status: bulkAction },
              {
                onSettled: () => {
                  setBulkAction(null);
                  setSelectedIds([]);
                },
              },
            );
          }
        }}
      />
    </div>
  );
}
