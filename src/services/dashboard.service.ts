import type { ApiResponse, DashboardStats } from "../types/api.types";
import { api } from "../lib/axios";

export const dashboardService = {
  getStats: async () => {
    const { data } =
      await api.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return data.data!;
  },
};
