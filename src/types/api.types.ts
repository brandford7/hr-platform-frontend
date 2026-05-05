// ─────────────────────────────────────────────────────────────────────────────
// HR Platform — Shared API types
// All interfaces here mirror the exact shape returned by the backend.
// Import from here everywhere — never redefine interfaces in service files.
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic response wrappers ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface SetPasswordInput {
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  roleName: "ADMIN" | "MANAGER" | "EMPLOYEE";
  roleDisplayName: string;
  employeeId: string | null;
  firstName: string | null;
  lastName: string | null;
  departmentId: string | null;
  jobPosition: string | null;
  
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
  mustChangePassword: boolean;
}

// ── Employees ─────────────────────────────────────────────────────────────────

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TERMINATED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  phone: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  salary: string | null;
  hireDate: string;
  terminationDate: string | null;
  emergencyContact: string | null;
  bio: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    mustChangePassword: boolean;
    lastLoginAt: string | null;
    role: { id: string; name: string; displayName: string };
  };
  department: { id: string; name: string } | null;
  jobPosition: { id: string; title: string } | null;
}

export interface CreateEmployeeInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  departmentId?: string;
  jobPositionId?: string;
  roleId: string;
  employmentType?: EmploymentType;
  salary?: number;
  hireDate: string;
  bio?: string;
  emergencyContact?: string;
}

// Only the fields HR/Admin can update on an existing employee
export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  departmentId?: string;
  jobPositionId?: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  salary?: number;
  hireDate?: string;
  bio?: string;
  emergencyContact?: string;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ── Departments ───────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
  _count: { employees: number };
}

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  managerId?: string | null;
}

export type UpdateDepartmentInput = Partial<CreateDepartmentInput>;

// ── Job Positions ─────────────────────────────────────────────────────────────

export interface JobPosition {
  id: string;
  title: string;
  description: string | null;
  minSalary: string | null;
  maxSalary: string | null;
  createdAt: string;
}

// ── Leave ─────────────────────────────────────────────────────────────────────

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  defaultDays: number;
  isPaid: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number | null;
  isActive: boolean;
  colorHex: string;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  resumptionDate: string | null;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  createdAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    avatarUrl: string | null;
    department: { name: string } | null;
  };
  leaveType: { id: string; name: string; colorHex: string; isPaid: boolean };
}

export interface LeaveBalance {
  leaveType: { id: string; name: string; colorHex: string; isPaid: boolean };
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}

export interface CreateLeaveInput {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewLeaveInput {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export interface BulkReviewInput {
  ids: string[];
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export interface LeaveQuery {
  page?: number;
  limit?: number;
  status?: LeaveStatus;
  employeeId?: string;
  departmentId?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortOrder?: "asc" | "desc";
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    pendingLeave: number;
    newHiresThisMonth: number;
    newHiresTrend: number;
    todayAttendance: number;
  };
  leaveByStatus: Array<{ status: LeaveStatus; count: number }>;
  employeesByDepartment: Array<{ name: string; count: number }>;
  employeesByStatus: Array<{ status: EmployeeStatus; count: number }>;
  recentLeaveRequests: LeaveRequest[];
  upcomingBirthdays: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    avatarUrl: string | null;
  }>;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "REMOTE";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workedHours: string | null;
  status: AttendanceStatus;
  notes: string | null;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    avatarUrl: string | null;
    department: { name: string } | null;
    jobPosition: { title: string } | null; // Pulling that "Jib Position" title
  };
}

// ── Holidays ──────────────────────────────────────────────────────────────────

export interface Holiday {
  id: string;
  name: string;
  date: string;
  year: number;
  description: string | null;
  isRecurring: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayInput {
  name: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
}

export interface UpdateHolidayInput {
  name?: string;
  date?: string;
  description?: string;
  isRecurring?: boolean;
}

export interface HolidayQuery {
  year?: number;
}

// ── Security (Roles / Duties / Privileges) ────────────────────────────────────

export interface Privilege {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
}

export interface Duty {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  privileges: Privilege[];
}

export interface RoleWithDuties {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  duties: Duty[];
}

export interface CreatePrivilegeInput {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface CreateDutyInput {
  name: string;
  displayName: string;
  description?: string;
  privilegeIds: string[];
}

export interface UpdateDutyInput {
  displayName?: string;
  description?: string;
  privilegeIds?: string[];
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
}

// Helper: group privileges by resource for the security page viewer
export function groupPrivilegesByResource(
  privileges: Privilege[],
): Record<string, Privilege[]> {
  return privileges.reduce<Record<string, Privilege[]>>((acc, p) => {
    const key = p.resource.charAt(0).toUpperCase() + p.resource.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(p);
    return acc;
  }, {});
}
