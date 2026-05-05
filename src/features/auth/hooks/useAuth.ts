import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type {
  LoginInput,
  SetPasswordInput,
  ChangePasswordInput,
} from "../../../types/api.types";
import { authService } from "../../../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user, data.mustChangePassword);
      if (data.mustChangePassword) {
        navigate("/set-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Invalid email or password");
    },
  });
}

export function useSetInitialPassword() {
  const { setAuth, setMustChangePassword } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SetPasswordInput) =>
      authService.setInitialPassword(input),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user, false);
      setMustChangePassword(false);
      toast.success("Password set successfully. Welcome!");
      navigate("/dashboard", { replace: true });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to set password");
    },
  });
}

export function useChangePassword() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authService.changePassword(input),
    onSuccess: () => {
      toast.success("Password changed. Please log in again.");
      clearAuth();
      navigate("/login", { replace: true });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to change password");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      navigate("/login", { replace: true });
    },
  });
}
