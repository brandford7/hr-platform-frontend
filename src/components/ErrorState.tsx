import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle size={22} className="text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} className="mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}

// Extracts the error message from axios error or any unknown error
export function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: { message?: string; errors?: Record<string, string[]> };
    };
    message?: string;
  };
  const apiMessage = axiosError?.response?.data?.message;
  const errors = axiosError?.response?.data?.errors;
  if (apiMessage) return apiMessage;
  if (errors) return Object.values(errors).flat().join(", ");
  return axiosError?.message ?? "An unexpected error occurred";
}
