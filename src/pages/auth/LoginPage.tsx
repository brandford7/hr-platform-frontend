import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useLogin } from "../../features/auth/hooks/useAuth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";


const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="flex justify-center lg:hidden mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">HR</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your HR Platform account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit((data) => login.mutate(data))}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@company.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending && (
            <Loader2 size={16} className="mr-2 animate-spin" />
          )}
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Contact your administrator if you need access.
      </p>
    </div>
  );
}
