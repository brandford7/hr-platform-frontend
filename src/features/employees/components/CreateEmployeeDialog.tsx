import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Dialog,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "../../../components/ui/select";
import { useCreateEmployee } from "../../../features/employees/hooks/useEmployees";
import { api } from "../../../lib/axios";
import { departmentService } from "../../../services/department.service";
import type { ApiResponse, Department } from "../../../types/api.types";
import { Label } from "../../../components/ui/label";

const schema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  roleId: z.uuid({ message: "Role is required" }),
  departmentId: z.uuid().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]),
  hireDate: z.string().min(1, "Required"),
  salary: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEmployeeDialog({ open, onOpenChange }: Props) {
  const createEmployee = useCreateEmployee();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: open,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } =
        await api.get<
          ApiResponse<Array<{ id: string; name: string; displayName: string }>>
        >("/roles");
      return data.data!;
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employmentType: "FULL_TIME" },
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      hireDate: new Date(data.hireDate).toISOString(),
      // If salary exists and isn't empty, convert it. Otherwise, pass undefined.
      salary:
        data.salary && data.salary.trim() !== ""
          ? Number(data.salary)
          : undefined,
    };

    createEmployee.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input {...register("firstName")} placeholder="John" />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input {...register("lastName")} placeholder="Doe" />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Temporary Password</Label>
            <Input
              {...register("password")}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select onValueChange={(v) => setValue("roleId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesData?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-xs text-destructive">
                  {errors.roleId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select onValueChange={(v) => setValue("departmentId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dept." />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((d: Department) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Employment Type</Label>
              <Select
                defaultValue="FULL_TIME"
                onValueChange={(v) =>
                  setValue("employmentType", v as FormValues["employmentType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Hire Date</Label>
              <Input {...register("hireDate")} type="date" />
              {errors.hireDate && (
                <p className="text-xs text-destructive">
                  {errors.hireDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Salary (optional)</Label>
            <Input
              {...register("salary")}
              type="number"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEmployee.isPending}>
              {createEmployee.isPending && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Create Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
