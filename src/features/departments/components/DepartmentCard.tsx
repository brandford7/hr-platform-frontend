import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Department } from "@/types/api.types";
import { Building2, Pencil, Trash2, UserCog, Users } from "lucide-react";

export function DepartmentCard({
  dept,
  onEdit,
  onDelete,
  onViewEmployees,
  canEdit,
  canDelete,
}: {
  dept: Department;
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
  onViewEmployees: (d: Department) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{dept.name}</CardTitle>
              {dept.description && (
                <CardDescription className="text-xs mt-0.5 line-clamp-1">
                  {dept.description}
                </CardDescription>
              )}
            </div>
          </div>

          {/* Action buttons — appear on hover */}
          {canEdit && (
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Edit department"
                onClick={() => onEdit(dept)}
              >
                <Pencil size={13} />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  title="Delete department"
                  onClick={() => onDelete(dept)}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Manager */}
        <div className="flex items-center gap-2 text-sm">
          <UserCog size={14} className="text-muted-foreground shrink-0" />
          {dept.manager ? (
            <span className="font-medium text-sm">
              {dept.manager.firstName} {dept.manager.lastName}
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (Manager)
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              No manager assigned
            </span>
          )}
        </div>

        {/* Headcount */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={14} />
          <span>
            {dept._count.employees} active employee
            {dept._count.employees !== 1 ? "s" : ""}
          </span>
        </div>

        {/* View employees button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1"
          onClick={() => onViewEmployees(dept)}
        >
          <Users size={13} className="mr-2" />
          View Employees
        </Button>
      </CardContent>
    </Card>
  );
}

