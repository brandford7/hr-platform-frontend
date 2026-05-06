import { getErrorMessage } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectTrigger, SelectValue, SelectContent, SelectItem ,Select} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { departmentService } from "@/services/department.service";
import { employeeService } from "@/services/employee.service";
import type { Department } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const deptSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(500).optional(),
  managerId: z.uuid().optional().or(z.literal("")),
});
type DeptFormValues = z.infer<typeof deptSchema>;

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  department?: Department;
}) {
  const qc = useQueryClient();
  const isEdit = !!department;

  // Fetch employees to populate manager dropdown
  const { data: employeesData } = useQuery({
    queryKey: ["employees", { limit: 100, status: "ACTIVE" }],
    queryFn: () => employeeService.getAll({ limit: 100, status: "ACTIVE" }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: DeptFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        managerId: values.managerId || undefined,
      };
      return isEdit
        ? departmentService.update(department.id, payload)
        : departmentService.create(payload);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success(isEdit ? "Department updated" : "Department created");
      onOpenChange(false);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      name: department?.name ?? "",
      description: department?.description ?? "",
      managerId: department?.manager?.id ?? "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Department" : "New Department"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Engineering"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What does this department do?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Department Manager</Label>
            <Select
              defaultValue={department?.manager?.id ?? ""}
              onValueChange={(v) =>
                setValue("managerId", v === "_none" ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No manager assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No manager</SelectItem>
                {employeesData?.data.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({emp.employeeCode})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The manager can view leave and attendance for this department.
            </p>
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
              {isEdit ? "Save Changes" : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
