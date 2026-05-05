import { useState} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  rolesService,
  type Duty,
  type RoleWithDuties,
} from "@/services/roles.service";
import { getErrorMessage } from "@/components/ErrorState";
import { DutySelectionList } from "./DutySelectionList";


export function AssignDutiesDialog({
  role,
  allDuties,
  open,
  onOpenChange,
}: {
  role: RoleWithDuties;
  allDuties: Duty[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(() => {
    // Initialize with existing duties if they exist
    return new Set(role?.duties?.map((d) => d.id) || []);
  });
  // Reset local state when dialog opens with a new role
  

  const mutation = useMutation({
    mutationFn: (dutyIds: string[]) =>
      rolesService.assignDuties(role.id, dutyIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      toast.success(`Duties updated for ${role.displayName}`);
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // Fixed: Using if/else instead of a ternary expression
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Duties — {role.displayName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure the duty bundles assigned to this role.
          </p>
        </DialogHeader>

        <DutySelectionList
          allDuties={allDuties}
          selectedIds={selected}
          onToggle={handleToggle}
        />

        <DialogFooter className="border-t pt-4">
          <p className="text-xs text-muted-foreground mr-auto self-center">
            {selected.size} duty{selected.size !== 1 ? "ies" : ""} selected
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate([...selected])}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="mr-2 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
