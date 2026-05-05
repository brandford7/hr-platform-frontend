import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


import { leaveService } from '../../../services/leave.service';
import type { CreateLeaveInput, ReviewLeaveInput, BulkReviewInput } from '../../../types/api.types';

export const LEAVE_KEY = 'leave';
export const LEAVE_TYPES_KEY = 'leaveTypes';
export const LEAVE_BALANCES_KEY = 'leaveBalances';

export function useLeaveRequests(params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: [LEAVE_KEY, params],
    queryFn: () => leaveService.getAll(params),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: [LEAVE_TYPES_KEY],
    queryFn: () => leaveService.getTypes(),
    staleTime: Infinity, // leave types rarely change
  });
}

export function useLeaveBalances() {
  return useQuery({
    queryKey: [LEAVE_BALANCES_KEY],
    queryFn: () => leaveService.getBalances(),
  });
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeaveInput) => leaveService.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [LEAVE_KEY] });
      void qc.invalidateQueries({ queryKey: [LEAVE_BALANCES_KEY] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to submit leave request');
    },
  });
}

export function useReviewLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewLeaveInput }) =>
      leaveService.review(id, input),
    onSuccess: (_data, { input }) => {
      void qc.invalidateQueries({ queryKey: [LEAVE_KEY] });
      toast.success(`Leave request ${input.status.toLowerCase()} successfully`);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to review leave request');
    },
  });
}

export function useBulkReviewLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkReviewInput) => leaveService.bulkReview(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: [LEAVE_KEY] });
      toast.success(`${data.succeeded} of ${data.total} requests processed`);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Bulk action failed');
    },
  });
}

export function useCancelLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveService.cancel(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [LEAVE_KEY] });
      void qc.invalidateQueries({ queryKey: [LEAVE_BALANCES_KEY] });
      toast.success('Leave request cancelled');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to cancel leave request');
    },
  });
}