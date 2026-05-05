import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, CalendarOff, RefreshCw, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

import { holidayService } from "@/services/holiday.service";
import { ErrorState, getErrorMessage } from "@/components/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddHolidayDialog } from "@/features/holidays/components/AddHolidaysDialog";
import { EditHolidayDialog } from "@/features/holidays/components/EditHolidayDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Holiday } from "@/types/api.types";

export function HolidaysPage() {
  const { user } = useAuthStore();
  const canManage = user?.roleName !== "Employee";
  const qc = useQueryClient();

  const [year, setYear] = useState(new Date().getFullYear());
  const [addOpen, setAddOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Holiday | null>(null);

  const {
    data: holidays,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["holidays", year],
    queryFn: () => holidayService.getAll({ year }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => holidayService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday removed");
      setDeleteTarget(null);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Public Holidays</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Leave cannot be requested on these dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Select year" // Fixes the a11y error
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {canManage && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Holiday
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : holidays?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
          <CalendarOff size={36} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            No holidays defined for {year}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} className="mr-2" /> Add the first holiday
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {holidays?.map((h) => (
            <Card
              key={h.id}
              className="group hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{h.name}</p>
                    {h.isRecurring && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 shrink-0 px-1"
                      >
                        <RefreshCw size={10} className="mr-1" /> Annual
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary font-semibold">
                    {format(parseISO(h.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  {h.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {h.description}
                    </p>
                  )}
                </div>
                {canManage && (
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => setSelectedHoliday(h)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/5"
                      onClick={() => setDeleteTarget(h)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Creation Dialog */}
      <AddHolidayDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Separate Edit Dialog */}
      {selectedHoliday && (
        <EditHolidayDialog
          holiday={selectedHoliday}
          open={!!selectedHoliday}
          onOpenChange={(open) => !open && setSelectedHoliday(null)}
        />
      )}

      {/* Deletion Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Holiday"
        description={`Remove "${deleteTarget?.name}" from the holiday calendar?`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
