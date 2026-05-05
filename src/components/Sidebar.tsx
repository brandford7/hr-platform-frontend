import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  ClipboardCheck,
  CalendarOff,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useAccess } from "@/features/security/hooks/useAccess";


export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const access = useAccess();

  // Build nav items conditionally — never show items the user cannot access
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    {
      to: "/employees",
      label: "Employees",
      icon: Users,
      show: access.canViewEmployeeList,
    },
    {
      to: "/departments",
      label: "Departments",
      icon: Building2,
      show: access.canViewDepartments,
    },
    { to: "/leave", label: "Leave", icon: CalendarDays, show: true },
    {
      to: "/attendance",
      label: "Attendance",
      icon: ClipboardCheck,
      show: true,
    },
    {
      to: "/holidays",
      label: "Holidays",
      icon: CalendarOff,
      show: access.canViewHolidays,
    },
    {
      to: "/security",
      label: "Security",
      icon: Shield,
      show: access.canViewSecurity,
    },
  ].filter((item) => item.show);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full flex flex-col bg-sidebar text-sidebar-foreground",
          "transition-all duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 lg:w-16 -translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-xs">
                  HR
                </span>
              </div>
              <span className="font-semibold truncate">HR Platform</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              size={16}
              className={cn(
                "transition-transform",
                !sidebarOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70",
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {sidebarOpen && user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-semibold text-sidebar-primary-foreground shrink-0">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {user.roleDisplayName}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
