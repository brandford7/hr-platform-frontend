import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Employee status
  ACTIVE:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  INACTIVE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  SUSPENDED:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  TERMINATED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  // Leave status
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  APPROVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  // Attendance
  PRESENT:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ABSENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  LATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HALF_DAY: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  REMOTE:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  // Employment type
  FULL_TIME: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PART_TIME: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  CONTRACT:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  INTERN: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs font-medium border-0",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
