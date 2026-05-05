import { DataTable } from "@/components/DataTable";
import { MonthYearPicker } from "./MonthYearPicker";
import { Calendar } from "lucide-react";
import { ErrorState, getErrorMessage } from "@/components/ErrorState";
import type { AttendanceRecord } from "@/types/api.types";
import { StatusBadge } from "@/components/StatusBadge";
import { format, parseISO } from "date-fns";
import { attendanceService } from "@/services/attendance.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function MyAttendanceHistory() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["attendance", "my", month, year],
    queryFn: () => attendanceService.getMy(month, year),
  });

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (r: AttendanceRecord) => (
        <span className="font-medium">
          {format(parseISO(r.date), "EEE, MMM d")}
        </span>
      ),
    },
    {
      key: "checkIn",
      label: "Check In",
      render: (r: AttendanceRecord) =>
        r.checkIn ? (
          <span className="text-emerald-600">
            {format(parseISO(r.checkIn), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "checkOut",
      label: "Check Out",
      render: (r: AttendanceRecord) =>
        r.checkOut ? (
          <span className="text-rose-500">
            {format(parseISO(r.checkOut), "h:mm a")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "hours",
      label: "Hours",
      render: (r: AttendanceRecord) =>
        r.workedHours ? (
          <span className="font-medium">{r.workedHours}h</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: AttendanceRecord) => <StatusBadge status={r.status} />,
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
          <Calendar size={16} className="text-muted-foreground" /> My Monthly Attendance
          Record
        </h2>
        <MonthYearPicker
          month={month}
          year={year}
          onMonth={setMonth}
          onYear={setYear}
        />
      </div>
      <DataTable
        data={(history ?? []).map((r, i) => ({ ...r, id: r.id ?? String(i) }))}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No records for this month"
      />
    </div>
  );
}
