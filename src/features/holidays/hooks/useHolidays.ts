import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { holidayService } from "@/services/holiday.service";
import type {
  CreateHolidayInput,
  UpdateHolidayInput,
  HolidayQuery,
} from "@/types/api.types";
import { getErrorMessage } from "@/components/ErrorState";


export const holidayKeys = {
  all: ["holidays"] as const,
  byYear: (year: number) => ["holidays", year] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useHolidays(query: HolidayQuery = {}) {
  const year = query.year ?? new Date().getFullYear();
  return useQuery({
    queryKey: holidayKeys.byYear(year),
    queryFn: () => holidayService.getAll({ year }),
    staleTime: 1000 * 60 * 10,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHolidayInput) => holidayService.create(input),
    onSuccess: (holiday) => {
      void qc.invalidateQueries({ queryKey: holidayKeys.byYear(holiday.year) });
      void qc.invalidateQueries({ queryKey: holidayKeys.all });
      toast.success(`"${holiday.name}" added to holiday calendar`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHolidayInput }) =>
      holidayService.update(id, input),
    onSuccess: (holiday) => {
      void qc.invalidateQueries({ queryKey: holidayKeys.byYear(holiday.year) });
      void qc.invalidateQueries({ queryKey: holidayKeys.all });
      toast.success(`"${holiday.name}" updated`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    // year passed alongside id so we can invalidate the correct year cache
    mutationFn: ({ id }: { id: string; year: number }) =>
      holidayService.delete(id),
    onSuccess: (_data, { year }) => {
      void qc.invalidateQueries({ queryKey: holidayKeys.byYear(year) });
      void qc.invalidateQueries({ queryKey: holidayKeys.all });
      toast.success("Holiday removed");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}
