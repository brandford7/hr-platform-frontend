import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState, getErrorMessage } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentCard } from "@/features/departments/components/DepartmentCard";
import { DeptEmployeesDialog } from "@/features/departments/components/DepartmentEmployeesDialog";
import { DepartmentFormDialog } from "@/features/departments/components/DepartmentForDialog";
import { useAccess } from "@/features/security/hooks/useAccess";
import { departmentService } from "@/services/department.service";
import type { Department } from "@/types/api.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";



export function DepartmentsPage() {
  const access = useAccess();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [empViewTarget, setEmpViewTarget] = useState<Department | null>(null);

  const {
    data: departments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted");
      setDeleteTarget(null);
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });

  const filtered = search
    ? (departments ?? []).filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : (departments ?? []);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load departments"
        message={(error as { message?: string })?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {departments?.length ?? 0} department
            {(departments?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {access.canCreateDepartment && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} className="mr-2" /> New Department
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search departments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
          <Building2 size={40} className="text-muted-foreground" />
          <div>
            <p className="font-medium">
              {search
                ? "No departments match your search"
                : "No departments yet"}
            </p>
            {!search && access.canCreateDepartment && (
              <p className="text-sm text-muted-foreground mt-1">
                Create the first department to organise your team.
              </p>
            )}
          </div>
          {!search && access.canCreateDepartment && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} className="mr-2" /> Create Department
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              canEdit={access.canEditDepartment}
              canDelete={access.canDeleteDepartment}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onViewEmployees={setEmpViewTarget}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <DepartmentFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit dialog */}
      {editTarget && (
        <DepartmentFormDialog
          open
          onOpenChange={(o) => !o && setEditTarget(null)}
          department={editTarget}
        />
      )}

      {/* Employees list dialog */}
      {empViewTarget && (
        <DeptEmployeesDialog
          department={empViewTarget}
          open
          onOpenChange={(o) => !o && setEmpViewTarget(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Department"
        description={`Delete "${deleteTarget?.name}"? Employees in this department will be unassigned. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
