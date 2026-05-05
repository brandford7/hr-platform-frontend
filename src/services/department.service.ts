import { api } from "../lib/axios";
import type {
  ApiResponse,
  Department,
  CreateDepartmentInput,
} from "../types/api.types";

export const departmentService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Department[]>>("/departments");
    return data.data!;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Department>>(
      `/departments/${id}`,
    );
    return data.data!;
  },

  create: async (input: CreateDepartmentInput) => {
    const { data } = await api.post<ApiResponse<Department>>(
      "/departments",
      input,
    );
    return data.data!;
  },

  update: async (id: string, input: Partial<CreateDepartmentInput>) => {
    const { data } = await api.patch<ApiResponse<Department>>(
      `/departments/${id}`,
      input,
    );
    return data.data!;
  },

  delete: async (id: string) => {
    await api.delete(`/departments/${id}`);
  },
};
