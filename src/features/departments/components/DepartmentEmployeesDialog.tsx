import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { employeeService } from "@/services/employee.service";
import type { Department, Employee } from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useState } from "react";

export function DeptEmployeesDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["employees", { departmentId: department.id, limit: 100 }],
    queryFn: () =>
      employeeService.getAll({ departmentId: department.id, limit: 100 }),
    enabled: open,
  });

  const employees = data?.data ?? [];
  const filtered = search
    ? employees.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.employeeCode}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : employees;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{department.name} — Employees</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {department._count.employees} active employee
            {department._count.employees !== 1 ? "s" : ""}
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search
                ? "No employees match your search"
                : "No employees in this department"}
            </p>
          ) : (
            filtered.map((emp: Employee) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {emp.firstName[0]}
                    {emp.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none">
                    {emp.firstName} {emp.lastName}
                    {department.manager?.id === emp.id && (
                      <Badge
                        className="ml-2 text-[10px] px-1.5 py-0"
                        variant="secondary"
                      >
                        Manager
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {emp.employeeCode} ·{" "}
                    {emp.jobPosition?.title ?? emp.user.role.displayName}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={emp.status} />
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  Since {format(new Date(emp.hireDate), "MMM yyyy")}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}