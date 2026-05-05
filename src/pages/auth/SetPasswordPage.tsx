import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSetInitialPassword } from "../../features/auth/hooks/useAuth";
import { useAuthStore } from "../../store/auth.store";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";


const strongPassword = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[0-9]/, "At least one number")
  .regex(/[^A-Za-z0-9]/, "At least one special character");

const schema = z
  .object({
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function SetPasswordPage() {
  const { user } = useAuthStore();
  const setPassword = useSetInitialPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={24} className="text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set your password</h1>
        <p className="text-sm text-muted-foreground">
          Hi {user?.firstName ?? "there"}! Your admin has provisioned your
          account. Please set a secure password to continue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => setPassword.mutate(data))}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password requirements */}
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>At least 8 characters</li>
          <li>At least one uppercase letter</li>
          <li>At least one number</li>
          <li>At least one special character</li>
        </ul>

        <Button
          type="submit"
          className="w-full"
          disabled={setPassword.isPending}
        >
          {setPassword.isPending && (
            <Loader2 size={16} className="mr-2 animate-spin" />
          )}
          {setPassword.isPending
            ? "Setting password…"
            : "Set password & continue"}
        </Button>
      </form>
    </div>
  );
}
