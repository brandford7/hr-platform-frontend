import { useState } from "react";
import { Link } from "react-router";
import { Plus, Eye, Trash2, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  useEmployees,
  useDeleteEmployee,
} from "@/features/employees/hooks/useEmployees";
import { useAuthStore } from "@/store/auth.store";
import { departmentService } from "@/services/department.service";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Employee,
  EmployeeStatus,
  EmploymentType,
} from "@/types/api.types";
import { EditEmployeeDialog } from "@/features/employees/components/EditEmployeeDialog";
import { CreateEmployeeDialog } from "@/features/employees/components/CreateEmployeeDialog";

const STATUS_OPTIONS: EmployeeStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "TERMINATED",
];
const TYPE_OPTIONS: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
];

export function EmployeesPage() {
  const { user } = useAuthStore();
  const isAdminOrManager = user?.roleName !== "EMPLOYEE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const resetPage = () => setPage(1);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: isAdminOrManager,
  });

  const { data, isLoading, isError, error, refetch } = useEmployees({
    page,
    limit: 10,
    search: search || undefined,
    departmentId: deptFilter || undefined,
    status: (statusFilter as EmployeeStatus) || undefined,
    employmentType: (typeFilter as EmploymentType) || undefined,
  });

  const deleteEmployee = useDeleteEmployee();
  const activeFilters = [deptFilter, statusFilter, typeFilter].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setDeptFilter("");
    setStatusFilter("");
    setTypeFilter("");
    resetPage();
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-sm leading-none">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.employeeCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Email",
      render: (row: Employee) => (
        <span className="text-sm text-muted-foreground">{row.user.email}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (row: Employee) =>
        row.department ? (
          <Badge variant="outline" className="text-xs">
            {row.department.name}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">Unassigned</span>
        ),
    },
    {
      key: "position",
      label: "Position",
      render: (row: Employee) => (
        <span className="text-xs text-muted-foreground">
          {row.jobPosition?.title ?? "—"}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row: Employee) => (
        <span className="text-xs">{row.user.role.displayName}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Employee) => <StatusBadge status={row.status} />,
    },
    {
      key: "type",
      label: "Type",
      render: (row: Employee) => <StatusBadge status={row.employmentType} />,
    },
    {
      key: "hireDate",
      label: "Hire Date",
      render: (row: Employee) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.hireDate), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-28",
      render: (row: Employee) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
            title="View"
          >
            <Link to={`/employees/${row.id}`}>
              <Eye size={14} />
            </Link>
          </Button>
          {isAdminOrManager && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Edit"
                onClick={() => setEditTarget(row)}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Remove"
                onClick={() => setDeleteTarget(row)}
              >
                <Trash2 size={14} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <ErrorState
        title="Failed to load employees"
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
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.pagination.total ?? 0} total employees
          </p>
        </div>
        {isAdminOrManager && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Employee
          </Button>
        )}
      </div>

      {/* Filters — admin/manager only */}
      {isAdminOrManager && (
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={deptFilter}
            onValueChange={(v) => {
              setDeptFilter(v === "_all" ? "" : v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-8 w-48 text-xs">
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

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === "_all" ? "" : v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v === "_all" ? "" : v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All types</SelectItem>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace("_", " ")}
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
        </div>
      )}

      {/* Table */}
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          resetPage();
        }}
        searchPlaceholder="Search by name, code or email…"
        emptyMessage="No employees match your filters"
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

      {/* Dialogs */}
      <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editTarget && (
        <EditEmployeeDialog
          employee={editTarget}
          open
          onOpenChange={(o) => !o && setEditTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Employee"
        description={`Remove ${deleteTarget?.firstName} ${deleteTarget?.lastName}? Their account will be terminated. This cannot be undone.`}
        confirmLabel="Remove"
        isLoading={deleteEmployee.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteEmployee.mutate(deleteTarget.id, {
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}
