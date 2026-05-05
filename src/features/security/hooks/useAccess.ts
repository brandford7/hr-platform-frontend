
import { useAuthStore } from "@/store/auth.store";


export function useAccess() {
  const { user } = useAuthStore();
 
    // 1. System Role Flags (from the Role table)
    
  const roleName = user?.roleName;
  const isAdmin = roleName === "ADMIN";
  const isHR = roleName === "MANAGER";
  const isAdminOrHR = isAdmin || isHR;

  // 2. Job Position Flags (from the JobPosition table)
  // Matching the "Department Manager" title from your seeded positions
  const isDeptManager = user?.jobPosition === "Department Manager";

  // 3. Combined Authority Flags
  // Used for features shared by Admins, HR, and Managers
  const isManagerial = isAdminOrHR || isDeptManager;

  return {
    // Identity
    role: roleName,
    position: user?.jobPosition,
    isAdmin,
    isHR,
    isAdminOrHR,
    isDeptManager,
    isManagerial,

    // ── Page Access ─────────────────────────────────────────────────────────
    // Drives Sidebar visibility and high-level Route Guards
    canViewEmployeeList: isManagerial,
    canViewDepartments: isAdminOrHR, // Usually only Admin/HR manage the org structure
    canViewHolidays: true, // Everyone usually needs to see the holiday calendar
    canViewSecurity: isAdmin, // Strictly for system admins

    // ── Employee Management ─────────────────────────────────────────────────
    canCreateEmployee: isAdminOrHR,
    canEditEmployee: isAdminOrHR,
    canDeleteEmployee: isAdmin,

    // ── Department Management ───────────────────────────────────────────────
    canCreateDepartment: isAdmin,
    canEditDepartment: isAdminOrHR,
    canDeleteDepartment: isAdmin,
    canAssignManager: isAdmin,

    // ── Leave & Attendance ──────────────────────────────────────────────────
    canApproveLeave: isManagerial,
    canViewAllLeave: isAdminOrHR,
    canViewDeptLeave: isDeptManager,

    // Attendance logic matches your backend refactor
    canViewAllAttendance: isAdminOrHR,
    canViewDeptAttendance: isDeptManager,

    // ── Financials & Security ───────────────────────────────────────────────
    canViewSalary: isAdminOrHR, // Managers usually shouldn't see salaries unless explicitly allowed
    canManageHolidays: isAdminOrHR,
    canManageSecurity: isAdmin,
  };
}
