import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: "system",

        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "hr-ui-store",
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      },
    ),
    { name: "UIStore" },
  ),
);
