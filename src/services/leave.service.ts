import { api } from "../lib/axios";
import type {
  ApiResponse,
  PaginatedResponse,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  CreateLeaveInput,
  ReviewLeaveInput,
  BulkReviewInput,
} from "../types/api.types";

export const leaveService = {
  getAll: async (params: Record<string, unknown> = {}) => {
    const { data } = await api.get<PaginatedResponse<LeaveRequest>>("/leave", {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<LeaveRequest>>(`/leave/${id}`);
    return data.data!;
  },

  create: async (input: CreateLeaveInput) => {
    const { data } = await api.post<ApiResponse<LeaveRequest>>("/leave", input);
    return data.data!;
  },

  review: async (id: string, input: ReviewLeaveInput) => {
    const { data } = await api.patch<ApiResponse<LeaveRequest>>(
      `/leave/${id}/review`,
      input,
    );
    return data.data!;
  },

  bulkReview: async (input: BulkReviewInput) => {
    const { data } = await api.patch<
      ApiResponse<{ succeeded: number; failed: number; total: number }>
    >("/leave/bulk-review", input);
    return data.data!;
  },

  cancel: async (id: string) => {
    await api.patch(`/leave/${id}/cancel`);
  },

  getBalances: async () => {
    const { data } =
      await api.get<ApiResponse<LeaveBalance[]>>("/leave/balances");
    return data.data!;
  },

  getTypes: async () => {
    const { data } = await api.get<ApiResponse<LeaveType[]>>("/leave-types");
    return data.data!;
  },
};
