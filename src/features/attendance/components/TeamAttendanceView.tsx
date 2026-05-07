import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Users } from "lucide-react";
import { ErrorState, getErrorMessage } from "@/components/ErrorState";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";

import { useAccess } from "@/features/security/hooks/useAccess";
import { useAuthStore } from "@/store/auth.store"; // Ensure this path is correct
import { attendanceService } from "@/services/attendance.service";
import { departmentService } from "@/services/department.service";
import { MonthYearPicker } from "./MonthYearPicker";
import type { AttendanceWithEmployee } from "@/types/api.types";

interface TeamAttendanceViewProps {
  scopeToDept?: boolean;
}

export function TeamAttendanceView({ scopeToDept }: TeamAttendanceViewProps) {
  const { user } = useAuthStore();
  const access = useAccess();

  // State
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  /**
   * Logic: Determine the Department ID for the API call
   * 1. If scopeToDept is true (Manager mode), we use the user's own deptId.
   * 2. If false (Admin/HR mode), we use the manual deptFilter selection.
   */
  const effectiveDeptId = scopeToDept
    ? (user?.departmentId ?? undefined)
    : deptFilter || undefined;
  
  // Fetch Departments List (Only if user is Admin/HR and NOT scoped to a single dept)
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: access.canViewAllAttendance && !scopeToDept,
  });

  // Fetch Attendance Records
  const {
    data: records,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["attendance", "team", month, year, effectiveDeptId],
    queryFn: () =>
      attendanceService.getAllAttendance({
        month,
        year,
        departmentId: effectiveDeptId,
      }),
    // Don't run the query if we are in manager mode but the user has no deptId
    enabled: !scopeToDept || !!user?.departmentId,
  });

  const allRecords = (records ?? []) as AttendanceWithEmployee[];

  // Client-side search filtering
  const filtered = search
    ? allRecords.filter((r) =>
        `${r.employee.firstName} ${r.employee.lastName} ${r.employee.employeeCode}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : allRecords;

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (r: AttendanceWithEmployee) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {r.employee.firstName[0]}
            {r.employee.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              {r.employee.firstName} {r.employee.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.employee.department?.name ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (r: AttendanceWithEmployee) => (
        <span className="text-sm">
          {format(parseISO(r.date), "EEE, MMM d")}
        </span>
      ),
    },
    {
      key: "checkIn",
      label: "Check In",
      render: (r: AttendanceWithEmployee) =>
        r.checkIn ? (
          <span className="text-emerald-600 text-sm font-medium">
            {format(parseISO(r.checkIn), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (r: AttendanceWithEmployee) =>
        r.checkOut ? (
          <span className="text-rose-500 text-sm font-medium">
            {format(parseISO(r.checkOut), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "hours",
      label: "Hours",
      render: (r: AttendanceWithEmployee) =>
        r.workedHours ? (
          <Badge variant="outline" className="text-[10px] font-bold">
            {r.workedHours}h
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: AttendanceWithEmployee) => <StatusBadge status={r.status} />,
    },
  ];

  if (isError) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/5 rounded-lg">
            <Users size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">
              {scopeToDept
                ? "Department Attendance"
                : "Organization Attendance"}
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {scopeToDept ? user?.departmentId : "Full Overview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Department filter — ONLY shown to Admin/HR if NOT already scoped */}
          {!scopeToDept && access.canViewAllAttendance && (
            <Select
              value={deptFilter}
              onValueChange={(v) => setDeptFilter(v === "_all" ? "" : v)}
            >
              <SelectTrigger className="h-9 w-48 text-xs bg-background">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Departments</SelectItem>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <MonthYearPicker
            month={month}
            year={year}
            onMonth={setMonth}
            onYear={setYear}
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee name or ID..."
        emptyMessage={
          search
            ? "No employees found matching that search."
            : "No attendance records found for this period."
        }
      />
    </div>
  );
}
