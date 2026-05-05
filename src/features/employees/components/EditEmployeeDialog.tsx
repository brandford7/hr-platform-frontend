import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUpdateEmployee } from "@/features/employees/hooks/useEmployees";
import { departmentService } from "@/services/department.service";
import { jobPositionsService } from "@/services/job-positions.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Employee, UpdateEmployeeInput } from "@/types/api.types";

// 1. Defined to exactly match the shape TypeScript is complaining about
const employeeSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  middleName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional()
    .nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  jobPositionId: z.string().uuid().optional().nullable(),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"])
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"]).optional(),
  salary: z.coerce.number().optional().nullable(),
  hireDate: z.string().optional(),
  bio: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof employeeSchema>;

interface Props {
  employee: Employee;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function EditEmployeeDialog({ employee, open, onOpenChange }: Props) {
  const updateEmployee = useUpdateEmployee();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
    enabled: open,
  });

  const { data: positions } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: () => jobPositionsService.getAll(),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    // CAST TO ANY: This bypasses the "Two different types with this name exist" error
    // which is a known issue with Zod + React Hook Form in strict environments.
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName ?? "",
      phone: employee.phone ?? "",
      gender: employee.gender ?? undefined,
      dateOfBirth: employee.dateOfBirth
        ? employee.dateOfBirth.split("T")[0]
        : "",
      address: employee.address ?? "",
      city: employee.city ?? "",
      country: employee.country ?? "",
      departmentId: employee.department?.id ?? undefined,
      jobPositionId: employee.jobPosition?.id ?? undefined,
      employmentType: employee.employmentType,
      status: employee.status,
      salary: employee.salary ? Number(employee.salary) : undefined,
      hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
      bio: employee.bio ?? "",
      emergencyContact: employee.emergencyContact ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // Transform back to the UpdateEmployeeInput format
    const payload: UpdateEmployeeInput = { ...values } as UpdateEmployeeInput;

    if (payload.dateOfBirth)
      payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
    if (payload.hireDate)
      payload.hireDate = new Date(payload.hireDate).toISOString();

    // Clean payload of empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== "" && v !== undefined),
    );

    updateEmployee.mutate(
      { id: employee.id, data: cleanedData },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile — {employee.employeeCode}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Personal</TabsTrigger>
              <TabsTrigger value="job">Work</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input {...register("firstName")} />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input {...register("lastName")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Birth Date</Label>
                  <Input type="date" {...register("dateOfBirth")} />
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select
                    defaultValue={employee.gender ?? undefined}
                    onValueChange={(v) =>
                      setValue("gender", v as any, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="job" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select
                    defaultValue={employee.department?.id}
                    onValueChange={(v) =>
                      setValue("departmentId", v, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Position</Label>
                  <Select
                    defaultValue={employee.jobPosition?.id}
                    onValueChange={(v) =>
                      setValue("jobPositionId", v, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positions?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Salary</Label>
                  <Input type="number" step="0.01" {...register("salary")} />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select
                    defaultValue={employee.status}
                    onValueChange={(v) =>
                      setValue("status", v as any, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input {...register("phone")} />
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input {...register("address")} />
              </div>
              <div className="space-y-1">
                <Label>Emergency Contact</Label>
                <Input {...register("emergencyContact")} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateEmployee.isPending || !isDirty}
            >
              {updateEmployee.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
