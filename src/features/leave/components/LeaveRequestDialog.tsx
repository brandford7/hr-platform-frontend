import { z} from "zod"
import { useCreateLeaveRequest, useLeaveTypes } from "../hooks/useLeave";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


const requestSchema = z
  .object({
    leaveTypeId: z.string().uuid("Required"),
    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),
    reason: z.string().min(10, "Please provide at least 10 characters"),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });
type RequestFormValues = z.infer<typeof requestSchema>;

export function RequestLeaveDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: leaveTypes } = useLeaveTypes();
  const createLeave = useCreateLeaveRequest();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
  });

  const onSubmit = (values: RequestFormValues) => {
    createLeave.mutate(
      {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Leave Type</Label>
            <Select onValueChange={(v) => setValue("leaveTypeId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: t.colorHex }}
                      />
                      {t.name}
                      <span className="text-muted-foreground text-xs">
                        ({t.defaultDays}d/yr)
                      </span>
                      {!t.isPaid && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          Unpaid
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leaveTypeId && (
              <p className="text-xs text-destructive">
                {errors.leaveTypeId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
             Weekends and public holidays are automatically excluded. Your
            resumption date will be shown after approval.
          </p>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea
              {...register("reason")}
              rows={3}
              placeholder="Briefly describe your reason…"
            />
            {errors.reason && (
              <p className="text-xs text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLeave.isPending}>
              {createLeave.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
