import { api } from "../lib/axios";
import type {
  ApiResponse,
  LoginInput,
  LoginResponse,
  SetPasswordInput,
  ChangePasswordInput,
} from "../types/api.types";

export const authService = {
  login: async (input: LoginInput) => {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      input,
    );
    return data.data!;
  },

  setInitialPassword: async (input: SetPasswordInput) => {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/set-password",
      input,
    );
    return data.data!;
  },

  changePassword: async (input: ChangePasswordInput) => {
    const { data } = await api.patch<ApiResponse<null>>(
      "/auth/change-password",
      input,
    );
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  refresh: async () => {
    const { data } =
      await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
    return data.data!;
  },
};
