import { api } from "../lib/axios";
import type { ApiResponse, AttendanceRecord, AttendanceWithEmployee } from "../types/api.types";

export const attendanceService = {
  checkIn: async (notes?: string) => {
    const { data } = await api.post<ApiResponse<AttendanceRecord>>(
      "/attendance/check-in",
      { notes },
    );
    return data.data!;
  },

  checkOut: async () => {
    const { data } = await api.post<ApiResponse<AttendanceRecord>>(
      "/attendance/check-out",
    );
    return data.data!;
  },

  getToday: async () => {
    const { data } =
      await api.get<ApiResponse<AttendanceRecord | null>>("/attendance/today");
    return data.data ?? null;
  },

  getMy: async (month?: number, year?: number) => {
    const { data } = await api.get<ApiResponse<AttendanceRecord[]>>(
      "/attendance/my",
      {
        params: { month, year },
      },
    );
    return data.data!;
  },

  getAllAttendance: async (
    params: {
      month?: number;
      year?: number;
      departmentId?: string;
      employeeId?: string;
    } = {},
  ): Promise<(AttendanceWithEmployee)[]> => {
    // Corrected endpoint to match router.get('/all')
    const { data } = await api.get<ApiResponse<(AttendanceRecord & {
      employee: {
        id: string;
        firstName: string;
        lastName: string;
        employeeCode: string;
        avatarUrl: string | null;
        department: { name: string } | null;
        jobPosition: { title: string } | null;
      };
    })[]>>("/attendance/all", { params });

    return data.data!;
  },
};
