import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rolesService } from "@/services/roles.service";
import type {
  CreatePrivilegeInput,
  CreateDutyInput,
  UpdateDutyInput,
  CreateRoleInput,
} from "@/types/api.types";
import { getErrorMessage } from "@/components/ErrorState";

// ── Query keys ────────────────────────────────────────────────────────────────

export const securityKeys = {
  roles: ["roles"] as const,
  duties: ["duties"] as const,
  privileges: ["privileges"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: securityKeys.roles,
    queryFn: () => rolesService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDuties(enabled = true) {
  return useQuery({
    queryKey: securityKeys.duties,
    queryFn: () => rolesService.getAllDuties(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrivileges(enabled = true) {
  return useQuery({
    queryKey: securityKeys.privileges,
    queryFn: () => rolesService.getAllPrivileges(),
    enabled,
    staleTime: Infinity, // seeded at boot, never changes at runtime
  });
}

// ── Role mutations ────────────────────────────────────────────────────────────

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => rolesService.create(input),
    onSuccess: (role) => {
      void qc.invalidateQueries({ queryKey: securityKeys.roles });
      toast.success(`Role "${role.displayName}" created`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

export function useAssignDuties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, dutyIds }: { roleId: string; dutyIds: string[] }) =>
      rolesService.assignDuties(roleId, dutyIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: securityKeys.roles });
      toast.success("Duties updated");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

export function useRemoveDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, dutyId }: { roleId: string; dutyId: string }) =>
      rolesService.removeDuty(roleId, dutyId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: securityKeys.roles });
      toast.success("Duty removed");
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

// ── Duty mutations ────────────────────────────────────────────────────────────

export function useCreateDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDutyInput) => rolesService.createDuty(input),
    onSuccess: (duty) => {
      void qc.invalidateQueries({ queryKey: securityKeys.duties });
      void qc.invalidateQueries({ queryKey: securityKeys.roles });
      toast.success(`Duty "${duty.displayName}" created`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateDuty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDutyInput }) => {
      // Option A: Provide a fallback if it's undefined
      const payload = {
        ...input,
        displayName: input.displayName ?? "", // Ensures it's a string
      };

      // Option B: If you're using Zod/Validation and KNOW it's there
      // rolesService.updateDuty(id, input as { displayName: string; description?: string }),

      return rolesService.updateDuty(
        id,
        payload as { displayName: string; description?: string },
      );
    },
    onSuccess: (duty) => {
      void qc.invalidateQueries({ queryKey: securityKeys.duties });
      void qc.invalidateQueries({ queryKey: securityKeys.roles });
      toast.success(`Duty "${duty.displayName}" updated`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}

// ── Privilege mutations ──

export function useCreatePrivilege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePrivilegeInput) =>
      rolesService.createPrivilege(input),
    onSuccess: (priv) => {
      void qc.invalidateQueries({ queryKey: securityKeys.privileges });
      void qc.invalidateQueries({ queryKey: securityKeys.duties });
      toast.success(`Privilege "${priv.name}" created`);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
}
