import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-sidebar p-12 text-sidebar-foreground">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              HR
            </span>
          </div>
          <span className="font-semibold text-lg">HR Platform</span>
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed text-sidebar-foreground/80">
              "Streamline your HR operations — from onboarding to leave
              management, all in one place."
            </p>
          </blockquote>
        </div>

        <div className="text-sm text-sidebar-foreground/50">
          © {new Date().getFullYear()} HR Platform. All rights reserved.
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
