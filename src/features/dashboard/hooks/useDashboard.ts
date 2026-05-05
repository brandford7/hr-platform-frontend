import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../../services/dashboard.service";


export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 1000 * 60 * 2, // refresh every 2 minutes
  });
}
