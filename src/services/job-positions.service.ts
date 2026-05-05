import { api } from "@/lib/axios";
import type { ApiResponse, JobPosition } from "@/types/api.types";

export const jobPositionsService = {
  getAll: async (): Promise<JobPosition[]> => {
    const { data } =
      await api.get<ApiResponse<JobPosition[]>>("/job-positions");
    return data.data!;
  },

  create: async (input: {
    title: string;
    description?: string;
    minSalary?: number;
    maxSalary?: number;
  }): Promise<JobPosition> => {
    const { data } = await api.post<ApiResponse<JobPosition>>(
      "/job-positions",
      input,
    );
    return data.data!;
  },

  update: async (
    id: string,
    input: Partial<{
      title: string;
      description?: string;
      minSalary?: number;
      maxSalary?: number;
    }>,
  ): Promise<JobPosition> => {
    const { data } = await api.patch<ApiResponse<JobPosition>>(
      `/job-positions/${id}`,
      input,
    );
    return data.data!;
  },
};
