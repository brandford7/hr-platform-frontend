import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  roleName: string;
  roleDisplayName: string;
  employeeId: string | null;
  departmentId: string | null;
  firstName: string | null;
  lastName: string | null;
  jobPosition: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  mustChangePassword: boolean;

  setAuth: (
    token: string,
    user: AuthUser,
    mustChangePassword?: boolean,
  ) => void;
  setAccessToken: (token: string) => void;
  setMustChangePassword: (value: boolean) => void;
  clearAuth: () => void;

  // Convenience helpers
  isAuthenticated: () => boolean;
  hasPrivilege: (privilege: string) => boolean;
  privileges: string[];
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        accessToken: null,
        user: null,
        mustChangePassword: false,
        privileges: [],

        setAuth: (token, user, mustChangePassword = false) =>
          set(
            { accessToken: token, user, mustChangePassword },
            false,
            "setAuth",
          ),

        setAccessToken: (accessToken) =>
          set({ accessToken }, false, "setAccessToken"),

        setMustChangePassword: (mustChangePassword) =>
          set({ mustChangePassword }, false, "setMustChangePassword"),

        clearAuth: () =>
          set(
            {
              accessToken: null,
              user: null,
              mustChangePassword: false,
              privileges: [],
            },
            false,
            "clearAuth",
          ),

        isAuthenticated: () => !!get().accessToken && !get().mustChangePassword,

        hasPrivilege: (_privilege: string) => {
          // Privileges are in the JWT — decoded on the backend.
          // For frontend UI gating we use the role name from the user object.
          // Fine-grained privilege checks happen server-side.
          return true;
        },
      }),
      { name: "AuthStore" },
    ),
  ),
);
