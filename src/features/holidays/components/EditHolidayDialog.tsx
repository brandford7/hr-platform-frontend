// features/holidays/components/EditHolidayDialog.tsx
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Dialog,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { holidayService } from "@/services/holiday.service";
import { getErrorMessage } from "@/components/ErrorState";
import type { Holiday } from "@/types/api.types";

// 1. Strict Schema: Ensure description matches your nullable DB field
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().nullable().optional(),
  isRecurring: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function EditHolidayDialog({
  holiday,
  open,
  onOpenChange,
}: {
  holiday: Holiday;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();

  // 2. Single useForm instance: Extract everything from one call
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Use this for useWatch
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      date: "",
      description: "",
      isRecurring: false,
    },
  });

  // 3. Link useWatch to the actual form control
  const isRecurring = useWatch({
    control,
    name: "isRecurring",
  });

  useEffect(() => {
    if (open && holiday) {
      reset({
        name: holiday.name,
        date: format(parseISO(holiday.date), "yyyy-MM-dd"),
        description: holiday.description ?? "", // Handle null from DB for Textarea
        isRecurring: holiday.isRecurring,
      });
    }
  }, [holiday, open, reset]);

 const mutation = useMutation({
   mutationFn: (input: FormValues) =>
     holidayService.update(holiday.id, {
       ...input,
       // If description is null, set it to undefined to satisfy the DTO
       description: input.description ?? undefined,
       date: new Date(input.date).toISOString(),
     }),
   onSuccess: () => {
     void qc.invalidateQueries({ queryKey: ["holidays"] });
     toast.success("Holiday updated successfully");
     onOpenChange(false);
   },
   onError: (e: unknown) => toast.error(getErrorMessage(e)),
 });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Holiday</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <Label>Holiday Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input {...register("date")} type="date" />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-recurring">Recurring annually</Label>
            <Switch
              id="edit-recurring"
              checked={isRecurring}
              onCheckedChange={(v) => setValue("isRecurring", v)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
