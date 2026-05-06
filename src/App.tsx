import { Routes, Route, Navigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { useAccess } from "@/features/security/hooks/useAccess";

// Layouts
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { SetPasswordPage } from "@/pages/auth/SetPasswordPage";

// App pages
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { EmployeeProfilePage } from "@/pages/employees/EmployeeProfilePage";
import { MyProfilePage } from "@/pages/employees/MyProfilePage";
import { DepartmentsPage } from "@/pages/departments/DepartmentsPage";
import { LeavePage } from "@/pages/leave/LeavePage";
import { AttendancePage } from "@/pages/attendance/AttendancePage";
import { HolidaysPage } from "@/pages/holidays/HolidaysPage";
import { SecurityPage } from "@/pages/security/SecurityPage";

// ── Base guards ───────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accessToken, mustChangePassword } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/set-password" replace />;
  return <>{children}</>;
}

function RequireUnauth({ children }: { children: React.ReactNode }) {
  const { accessToken, mustChangePassword } = useAuthStore();
  if (accessToken && !mustChangePassword)
    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequirePasswordChange({ children }: { children: React.ReactNode }) {
  const { accessToken, mustChangePassword } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (!mustChangePassword) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/**
 * Role-based route guard.
 * Redirects to /dashboard (not /login) so auth state is preserved.
 * Shows nothing while redirecting — no flash.
 */
function RequireAccess({
  allowed,
  children,
}: {
  allowed: boolean;
  children: React.ReactNode;
}) {
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const access = useAccess();

  return (
    <Routes>
      {/* ── Unauthenticated ── */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <RequireUnauth>
              <LoginPage />
            </RequireUnauth>
          }
        />
        <Route
          path="/set-password"
          element={
            <RequirePasswordChange>
              <SetPasswordPage />
            </RequirePasswordChange>
          }
        />
      </Route>

      {/* ── Authenticated ── */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Available to all authenticated users */}

        <Route path="/employees/me" element={<MyProfilePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/attendance" element={<AttendancePage />} />

        {/* Employee profile — any authenticated user can view their own;
            admin/manager can view anyone's via the employees list */}
        <Route path="/employees/:id" element={<EmployeeProfilePage />} />

        {/* Admin / Manager only */}
        <Route
          path="/dashboard"
          element={
            <RequireAccess allowed={access.canViewDashboard}>
              <DashboardPage />
            </RequireAccess>
          }
        />
        <Route
          path="/employees"
          element={
            <RequireAccess allowed={access.canViewEmployeeList}>
              <EmployeesPage />
            </RequireAccess>
          }
        />
        <Route
          path="/departments"
          element={
            <RequireAccess allowed={access.canViewDepartments}>
              <DepartmentsPage />
            </RequireAccess>
          }
        />
        <Route
          path="/holidays"
          element={
            <RequireAccess allowed={access.canViewHolidays}>
              <HolidaysPage />
            </RequireAccess>
          }
        />

        {/* Admin only */}
        <Route
          path="/security"
          element={
            <RequireAccess allowed={access.canViewSecurity}>
              <SecurityPage />
            </RequireAccess>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
