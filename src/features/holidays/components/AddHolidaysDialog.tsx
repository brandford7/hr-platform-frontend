import { getErrorMessage } from "@/components/ErrorState";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

// 1. Strict Schema: matches your Holiday interface requirements
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().nullable().optional(),
  isRecurring: z.boolean(), // Keep this strict for the resolver
});

type FormValues = z.infer<typeof schema>;

export function AddHolidayDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();

  // 2. Consolidate into one useForm call
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control, // Destructure control here
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

  // 3. Link useWatch to the correct control
  const isRecurring = useWatch({
    control,
    name: "isRecurring",
  });

  const mutation = useMutation({
    mutationFn: (input: FormValues) =>
      holidayService.create({
        ...input,
        // Convert null/empty to undefined if your DTO doesn't allow null
        description: input.description || undefined,
        date: new Date(input.date).toISOString(),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["holidays"] });
      toast.success("Holiday added successfully");
      onOpenChange(false);
      reset(); // Now resets the correct form state
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Public Holiday</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <Label>Holiday Name</Label>
            <Input {...register("name")} placeholder="e.g. Christmas Day" />
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
            <Label>Description (optional)</Label>
            <Textarea
              {...register("description")}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="recurring" className="cursor-pointer">
                Recurring annually
              </Label>
              <p className="text-xs text-muted-foreground">
                Applies every year on this date
              </p>
            </div>
            <Switch
              id="recurring"
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
              Add Holiday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
