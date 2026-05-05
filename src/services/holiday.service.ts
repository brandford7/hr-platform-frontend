import { api } from "@/lib/axios";
import type {
  ApiResponse,
  CreateHolidayInput,
  UpdateHolidayInput,
  HolidayQuery,
  Holiday,
} from "@/types/api.types";

export const holidayService = {
  getAll: async (query: HolidayQuery = {}): Promise<Holiday[]> => {
    const { data } = await api.get<ApiResponse<Holiday[]>>("/holidays", {
      params: query,
    });
    return data.data!;
  },

  create: async (input: CreateHolidayInput): Promise<Holiday> => {
    const { data } = await api.post<ApiResponse<Holiday>>("/holidays", {
      ...input,
      date: new Date(input.date).toISOString(),
    });
    return data.data!;
  },

  update: async (id: string, input: UpdateHolidayInput): Promise<Holiday> => {
    const { data } = await api.patch<ApiResponse<Holiday>>(`/holidays/${id}`, {
      ...input,
      ...(input.date && { date: new Date(input.date).toISOString() }),
    });
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/holidays/${id}`);
  },
};
