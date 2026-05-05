import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import  { employeeService } from "../../../services/employee.service";
import type { EmployeeQuery, CreateEmployeeInput, UpdateEmployeeInput } from "../../../types/api.types";

export const EMPLOYEES_KEY = "employees";

export function useEmployees(query: EmployeeQuery = {}) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, query],
    queryFn: () => employeeService.getAll(query),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, id],
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

/*
export function useMyProfile() {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, "me"],
    queryFn: () => employeeService.getMe(),
  });
}
*/

export function useMyProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [EMPLOYEES_KEY, "me"],
    queryFn: () => employeeService.getMe(),
    // --- RATE LIMIT PROTECTION ---
    staleTime: Infinity, // Data never goes "old" during the session
    gcTime: 30 * 60 * 1000, // Keep in memory for 30 mins
    refetchOnMount: false, // Don't refetch just because a component loaded
    refetchOnWindowFocus: false, // Don't refetch when clicking back into the browser
    refetchOnReconnect: false, // Don't refetch if internet toggles
    retry: false, // Do not retry if it fails (prevents loop on error)
    // ------------------------------
  });

  const getCachedProfile = () => {
    return queryClient.getQueryData([EMPLOYEES_KEY, "me"]);
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    getCachedProfile,
  };
}


export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => employeeService.create(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
      toast.success(`Employee ${data.firstName} ${data.lastName} created`, {
        description: `Temporary password: ${data.temporaryPassword}`,
        duration: 10000, // Keep visible so admin can copy it
      });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) =>
      employeeService.update(id, data),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY, id] });
      toast.success("Employee updated successfully");
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to update employee");
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] });
      toast.success("Employee removed successfully");
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to delete employee");
    },
  });
}
