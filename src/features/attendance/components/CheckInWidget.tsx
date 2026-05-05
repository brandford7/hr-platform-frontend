import { getErrorMessage } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceService } from "@/services/attendance.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export function CheckInWidget() {
  const qc = useQueryClient();

  const { data: todayRecord, isLoading } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: () => attendanceService.getToday(),
    refetchInterval: 60_000,
  });

  const checkIn = useMutation({
    mutationFn: () => attendanceService.checkIn(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Checked in!");
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const checkOut = useMutation({
    mutationFn: () => attendanceService.checkOut(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Checked out!");
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          Today — {format(new Date(), "EEEE, MMM d")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Check In</p>
                <p className="font-semibold text-emerald-600">
                  {todayRecord?.checkIn
                    ? format(parseISO(todayRecord.checkIn), "h:mm a")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check Out</p>
                <p className="font-semibold text-rose-500">
                  {todayRecord?.checkOut
                    ? format(parseISO(todayRecord.checkOut), "h:mm a")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="font-semibold">
                  {todayRecord?.workedHours
                    ? `${todayRecord.workedHours}h`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                size="sm"
                disabled={hasCheckedIn || checkIn.isPending}
                variant={hasCheckedIn ? "outline" : "default"}
                onClick={() => checkIn.mutate()}
              >
                <LogIn size={14} className="mr-2" />
                {hasCheckedIn ? "Checked In ✓" : "Check In"}
              </Button>
              <Button
                className="flex-1"
                size="sm"
                variant="outline"
                disabled={!hasCheckedIn || hasCheckedOut || checkOut.isPending}
                onClick={() => checkOut.mutate()}
              >
                <LogOut size={14} className="mr-2" />
                {hasCheckedOut ? "Checked Out ✓" : "Check Out"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
