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
import { useAccess } from "@/features/security/hooks/useAccess";
import { attendanceService } from "@/services/attendance.service";
import { departmentService } from "@/services/department.service";
import type {
  AttendanceWithEmployee,
} from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Users } from "lucide-react";
import { useState } from "react";
import { MonthYearPicker } from "./MonthYearPicker";
import { DataTable } from "@/components/DataTable";

export function TeamAttendanceView({ scopeToDept }: { scopeToDept?: boolean }) {
  //const { user } = useAuthStore();
  const access = useAccess();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: access.isAdmin, // managers only see their own dept
  });

  const {
    data: records,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["attendance", "all", month, year, deptFilter, scopeToDept],
    queryFn: () =>
      attendanceService.getAllAttendance({
        month,
        year,
        departmentId: deptFilter || undefined,
      }),
  });

  const allRecords = (records ?? []) as AttendanceWithEmployee[];

  // Client-side search
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
          <span className="text-emerald-600 text-sm">
            {format(parseISO(r.checkIn), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (r: AttendanceWithEmployee) =>
        r.checkOut ? (
          <span className="text-rose-500 text-sm">
            {format(parseISO(r.checkOut), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "hours",
      label: "Hours",
      render: (r: AttendanceWithEmployee) =>
        r.workedHours ? (
          <Badge variant="outline" className="text-xs">
            {r.workedHours}h
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: AttendanceWithEmployee) => <StatusBadge status={r.status} />,
    },
  ];

  if (isError)
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Users size={16} className="text-muted-foreground" />
          {access.isAdmin ? "All Employees" : "My Department"}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department filter — admin only */}
          {access.isAdmin && (
            <Select
              value={deptFilter}
              onValueChange={(v) => setDeptFilter(v === "_all" ? "" : v)}
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
        searchPlaceholder="Search by employee name or code…"
        emptyMessage="No attendance records for this period"
      />
    </div>
  );
}
