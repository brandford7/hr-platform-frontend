import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { rolesService, type RoleWithDuties } from "@/services/roles.service";
import { ErrorState, getErrorMessage } from "@/components/ErrorState";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssignDutiesDialog } from "@/features/security/components/AssignDutiesDialog";


export function SecurityPage() {
  const [selectedRole, setSelectedRole] = useState<RoleWithDuties | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const {
    data: roles,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesService.getAll(),
  });

  const { data: allDuties } = useQuery({
    queryKey: ["duties"],
    queryFn: () => rolesService.getAllDuties(),
  });

  if (isError) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Security Management</h1>
        
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Shield
            size={18}
            className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
          />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">
              Security model: Privileges → Duties → Roles
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              The <strong>Admin</strong> role always has all privileges and
              cannot be modified. Assign duties to other roles to control their
              access.
            </p>
          </div>
        </div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))
            : roles?.map((role) => (
                <Card key={role.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {role.displayName}
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs">
                          {role.description}
                        </CardDescription>
                      </div>
                      {role.name === "ADMIN" ? (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          Full Access
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {role.duties.length} duties
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    {role.name === "ADMIN" ? (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="flex items-center gap-1 text-emerald-600">
                          <Check size={12} /> All privileges granted
                          automatically
                        </p>
                        <p>
                          Admin bypasses the duty chain and receives every
                          privilege in the system.
                        </p>
                      </div>
                    ) : role.duties.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No duties assigned
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {role.duties.map((duty) => (
                          <div
                            key={duty.id}
                            className="flex items-center gap-2"
                          >
                            <ChevronRight
                              size={12}
                              className="text-muted-foreground shrink-0"
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs font-medium cursor-default">
                                  {duty.displayName}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-xs font-medium mb-1">
                                  Privileges in this duty:
                                </p>
                                <ul className="text-xs space-y-0.5">
                                  {duty.privileges.map((p) => (
                                    <li
                                      key={p.id}
                                      className="text-muted-foreground"
                                    >
                                      • {p.name}
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    )}

                    {role.name !== "ADMIN" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedRole(role);
                          setAssignOpen(true);
                        }}
                      >
                        Manage Duties
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* Assign duties dialog */}
      {selectedRole && allDuties && (
        <AssignDutiesDialog
          role={selectedRole}
          allDuties={allDuties}
          open={assignOpen}
          onOpenChange={(o) => {
            setAssignOpen(o);
            if (!o) setSelectedRole(null);
          }}
        />
      )}
    </TooltipProvider>
  );
}
