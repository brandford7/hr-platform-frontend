import { api } from "../lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeQuery,
} from "../types/api.types";

export const employeeService = {
  getAll: async (query: EmployeeQuery = {}) => {
    const { data } = await api.get<PaginatedResponse<Employee>>("/employees", {
      params: query,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data.data!;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<Employee>>("/employees/me");
    return data.data!;
  },

  create: async (input: CreateEmployeeInput) => {
    const { data } = await api.post<
      ApiResponse<Employee & { temporaryPassword: string }>
    >("/employees", input);
    return data.data!;
  },

  update: async (id: string, input: UpdateEmployeeInput) => {
    const { data } = await api.patch<ApiResponse<Employee>>(
      `/employees/${id}`,
      input,
    );
    return data.data!;
  },

  delete: async (id: string) => {
    await api.delete(`/employees/${id}`);
  },
};
