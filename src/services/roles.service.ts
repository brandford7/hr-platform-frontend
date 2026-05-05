import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

export interface Privilege {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface Duty {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  privileges: Privilege[];
}

export interface RoleWithDuties {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  duties: Duty[];
}

export const rolesService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<RoleWithDuties[]>>("/roles");
    return data.data!;
  },

  getAllDuties: async () => {
    const { data } = await api.get<ApiResponse<Duty[]>>("/roles/duties");
    return data.data!;
  },

  create: async (payload: {
    name: string;
    displayName: string;
    description?: string;
  }) => {
    const { data } = await api.post<ApiResponse<RoleWithDuties>>(
      "/roles",
      payload,
    );
    return data.data!;
  },

  getAllPrivileges: async () => {
    const { data } =
      await api.get<ApiResponse<Privilege[]>>("/roles/privileges");
    return data.data!;
  },

  assignDuties: async (roleId: string, dutyIds: string[]) => {
    const { data } = await api.post<ApiResponse<null>>(
      `/roles/${roleId}/duties`,
      { dutyIds },
    );
    return data;
  },

  
  createDuty: async (payload: { name: string; displayName: string; description?: string }) => {
    const { data } = await api.post<ApiResponse<Duty>>("/roles/duties", payload);
    return data.data!;
  },

  /**
   * Update an existing Duty's metadata
   */
  updateDuty: async (id: string, payload: { displayName: string; description?: string }) => {
    const { data } = await api.put<ApiResponse<Duty>>(`/roles/duties/${id}`, payload);
    return data.data!;
  },

  /**
   * Create a granular Privilege (Resource + Action)
   */
  createPrivilege: async (payload: { 
    name: string; 
    resource: string; 
    action: string; 
    description?: string 
  }) => {
    const { data } = await api.post<ApiResponse<Privilege>>("/roles/privileges", payload);
    return data.data!;
  },

  removeDuty: async (roleId: string, dutyId: string) => {
    await api.delete(`/roles/${roleId}/duties/${dutyId}`);
  },
};
