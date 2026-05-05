import { useParams, Link } from "react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  DollarSign,
} from "lucide-react";
import { useEmployee } from "../../features/employees/hooks/useEmployees";
import { useAuthStore } from "../../store/auth.store";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { StatusBadge } from "../../components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";


export function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isAdminOrManager = user?.roleName !== "EMPLOYEE";
  const { data: employee, isLoading } = useEmployee(id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!employee)
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button variant="outline" asChild>
          <Link to="/employees">← Back to Employees</Link>
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employees">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {employee.employeeCode}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {employee.user.role.displayName}
              </p>
            </div>
            <StatusBadge status={employee.status} />
            <StatusBadge status={employee.employmentType} />
          </CardContent>
        </Card>

        {/* Right panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={Mail} label="Email" value={employee.user.email} />
            <InfoItem
              icon={Phone}
              label="Phone"
              value={employee.phone ?? "—"}
            />
            <InfoItem
              icon={Building2}
              label="Department"
              value={employee.department?.name ?? "—"}
            />
            <InfoItem
              icon={Briefcase}
              label="Job Position"
              value={employee.jobPosition?.title ?? "—"}
            />
            <InfoItem
              icon={Calendar}
              label="Hire Date"
              value={format(new Date(employee.hireDate), "MMMM d, yyyy")}
            />
            {employee.city || employee.country ? (
              <InfoItem
                icon={MapPin}
                label="Location"
                value={[employee.city, employee.country]
                  .filter(Boolean)
                  .join(", ")}
              />
            ) : null}
            {/* Salary — admin/manager only */}
            {isAdminOrManager && employee.salary && (
              <InfoItem
                icon={DollarSign}
                label="Salary"
                value={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(parseFloat(employee.salary))}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {employee.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {employee.bio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
