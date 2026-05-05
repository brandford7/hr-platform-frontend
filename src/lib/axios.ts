import axios from "axios";
import { useAuthStore } from "../store/auth.store";


const BASE_URL = import.meta.env.VITE_API_URL 

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh token cookie
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as import("axios").AxiosError;
    const originalRequest =
      axiosError.config as import("axios").InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject }),
        ).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        queue.forEach((p) => p.resolve(newToken));
        queue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        queue.forEach((p) => p.reject(refreshError));
        queue = [];
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
