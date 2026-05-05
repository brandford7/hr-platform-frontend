import { api } from "@/lib/axios";
import type {
  ApiResponse,
  RoleWithDuties,
  Duty,
  Privilege,
  CreatePrivilegeInput,
  CreateDutyInput,
  UpdateDutyInput,
  CreateRoleInput,
} from "@/types/api.types";

export const rolesService = {
  // ── Roles ────────────────────────────────────────────────────────────────
  getAll: async (): Promise<RoleWithDuties[]> => {
    const { data } = await api.get<ApiResponse<RoleWithDuties[]>>("/roles");
    return data.data!;
  },

  create: async (input: CreateRoleInput): Promise<RoleWithDuties> => {
    const { data } = await api.post<ApiResponse<RoleWithDuties>>(
      "/roles",
      input,
    );
    return data.data!;
  },

  assignDuties: async (roleId: string, dutyIds: string[]): Promise<void> => {
    await api.post(`/roles/${roleId}/duties`, { dutyIds });
  },

  removeDuty: async (roleId: string, dutyId: string): Promise<void> => {
    await api.delete(`/roles/${roleId}/duties/${dutyId}`);
  },

  // ── Duties ───────────────────────────────────────────────────────────────
  getAllDuties: async (): Promise<Duty[]> => {
    const { data } = await api.get<ApiResponse<Duty[]>>("/roles/duties");
    return data.data!;
  },

  createDuty: async (input: CreateDutyInput): Promise<Duty> => {
    const { data } = await api.post<ApiResponse<Duty>>("/roles/duties", input);
    return data.data!;
  },

  updateDuty: async (id: string, input: UpdateDutyInput): Promise<Duty> => {
    const { data } = await api.patch<ApiResponse<Duty>>(
      `/roles/duties/${id}`,
      input,
    );
    return data.data!;
  },

  // ── Privileges ────────────────────────────────────────────────────────────
  getAllPrivileges: async (): Promise<Privilege[]> => {
    const { data } =
      await api.get<ApiResponse<Privilege[]>>("/roles/privileges");
    return data.data!;
  },

  createPrivilege: async (input: CreatePrivilegeInput): Promise<Privilege> => {
    const { data } = await api.post<ApiResponse<Privilege>>(
      "/roles/privileges",
      input,
    );
    return data.data!;
  },

  assignDutiesToEmployee: async (
    employeeId: string,
    dutyIds: string[],
  ): Promise<void> => {
    await api.post(`/employees/${employeeId}/duties`, { dutyIds });
  },
};
