import {
  Users,
  Building2,
  CalendarDays,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboard";
// import { useAuth } from "@/features/auth/hooks/useAuth"; // <-- Import your auth hook here
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  APPROVED: "#10b981",
  REJECTED: "#ef4444",
  CANCELLED: "#6b7280",
  ACTIVE: "#10b981",
  INACTIVE: "#6b7280",
  SUSPENDED: "#f59e0b",
  TERMINATED: "#ef4444",
};

const DEPT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

type BarFillFn = (
  entry: { name?: string; count?: number },
  index: number,
) => string;
const deptFill: BarFillFn = (_entry, index) =>
  DEPT_COLORS[index % DEPT_COLORS.length] ?? "#3b82f6";

type PieFillFn = (
  entry: { status?: string; count?: number },
  index: number,
) => string;
const leaveFill: PieFillFn = (entry) =>
  STATUS_COLORS[entry.status ?? ""] ?? "#94a3b8";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon; // Use React.ElementType if icons come from different sources
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {trend !== undefined && !loading && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  trend >= 0 ? "text-emerald-600" : "text-destructive",
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>
                  {Math.abs(trend)}% {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  

  const isAdminOrHr = user?.roleName !== "EMPLOYEE";
  const isEmployee = user?.roleName === "EMPLOYEE";
 
        const isManager = user?.jobPosition === "Department Manager";
  // 3. The backend should ideally filter the payload based on the user's token
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!isEmployee && (
          <>
            <StatCard
              title={isAdminOrHr ? "Total Employees" : "Department Employees"}
              value={stats?.overview.totalEmployees ?? 0}
              icon={Users}
              loading={isLoading}
            />
            <StatCard
              title={isAdminOrHr ? "Active Employees" : "Active in Department"}
              value={stats?.overview.activeEmployees ?? 0}
              icon={UserCheck}
              loading={isLoading}
            />
          </>
        )}

        {isAdminOrHr && (
          <StatCard
            title="Departments"
            value={stats?.overview.totalDepartments ?? 0}
            icon={Building2}
            loading={isLoading}
          />
        )}

        <StatCard
          title={
            isAdminOrHr
              ? "Pending Leave"
              : isManager
                ? "Dept Pending Leave"
                : "My Pending Leave"
          }
          value={stats?.overview.pendingLeave ?? 0}
          icon={CalendarDays}
          loading={isLoading}
        />

        {isEmployee && (
          <StatCard
            title="My Attendance"
            value={stats?.overview.todayAttendance ?? 0} // Map to personal attendance stat
            icon={Clock}
            loading={isLoading}
          />
        )}
      </div>

      {/* Secondary stat cards - Hidden for regular employees */}
      {!isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title={isAdminOrHr ? "New Hires This Month" : "Dept New Hires"}
            value={stats?.overview.newHiresThisMonth ?? 0}
            icon={TrendingUp}
            trend={stats?.overview.newHiresTrend}
            trendLabel="vs last month"
            loading={isLoading}
          />
          <StatCard
            title={isAdminOrHr ? "Today's Attendance" : "Dept Attendance"}
            value={stats?.overview.todayAttendance ?? 0}
            icon={Clock}
            loading={isLoading}
          />
        </div>
      )}

      {/* Charts row - Hidden for regular employees */}
      {!isEmployee && (
        <div
          className={cn(
            "grid gap-6",
            isAdminOrHr ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1",
          )}
        >
          {/* Employees by department — ONLY Admin/HR */}
          {isAdminOrHr && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Employees by Department
                </CardTitle>
                <CardDescription>
                  Active headcount per department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-56 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={stats?.employeesByDepartment ?? []}
                      margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Bar
                        dataKey="count"
                        name="Employees"
                        radius={[4, 4, 0, 0]}
                        fill={deptFill as unknown as string}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leave by status — Admin/HR and Managers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Leave Requests by Status
              </CardTitle>
              <CardDescription>
                {isAdminOrHr
                  ? "Distribution of all leave requests"
                  : "Distribution for your department"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats?.leaveByStatus ?? []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      fill={leaveFill as unknown as string}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs capitalize">
                          {String(value).toLowerCase()}
                        </span>
                      )}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom row — Lists */}
      <div
        className={cn(
          "grid gap-6",
          isEmployee ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
        )}
      >
        {/* Pending leave requests - Hidden for employees */}
        {!isEmployee && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isAdminOrHr
                  ? "Pending Leave Requests"
                  : "Department Pending Leave"}
              </CardTitle>
              <CardDescription>Awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !stats?.recentLeaveRequests.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-1">
                  {stats.recentLeaveRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between py-2.5 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {req.employee.firstName[0]}
                          {req.employee.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {req.employee.firstName} {req.employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.leaveType.name} · {req.totalDays}d
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0"
                        style={{
                          borderColor: req.leaveType.colorHex,
                          color: req.leaveType.colorHex,
                        }}
                      >
                        {req.leaveType.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming birthdays - Visible to all */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Birthdays</CardTitle>
            <CardDescription>Next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !stats?.upcomingBirthdays.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming birthdays
              </p>
            ) : (
              <div className="space-y-1">
                {stats.upcomingBirthdays.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {emp.firstName[0]}
                      {emp.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(emp.dateOfBirth), "MMMM d")}
                      </p>
                    </div>
                    <span
                      className="ml-auto text-lg"
                      role="img"
                      aria-label="birthday cake"
                    >
                      🎂
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
