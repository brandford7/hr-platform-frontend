import { CheckInWidget } from "@/features/attendance/components/CheckInWidget";
import { MyAttendanceHistory } from "@/features/attendance/components/MyAttendanceHistory";
import { TeamAttendanceView } from "@/features/attendance/components/TeamAttendanceView";
import { useAccess } from "@/features/security/hooks/useAccess";
import { format } from "date-fns";

export function AttendancePage() {
  const access = useAccess();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Check-in widget — always visible */}
      <CheckInWidget />

      {/* Own history — always visible */}
      <MyAttendanceHistory />

      {/* Team view — Admins/HR see all, Managers see only their department */}
      {(access.canViewAllAttendance || access.canViewDeptAttendance) && (
        <>
          <div className="border-t pt-4" />
          <TeamAttendanceView
            // If they can't view ALL, then we must scope to their DEPT
            scopeToDept={
              !access.canViewAllAttendance && access.canViewDeptAttendance
            }
          />
        </>
      )}
    </div>
  );
}
