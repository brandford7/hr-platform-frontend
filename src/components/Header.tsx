import {
  Menu,
  Bell,
  Sun,
  Moon,
  Monitor,
  LogOut,
  User,
  KeyRound,
} from "lucide-react";
import { Link } from "react-router";
import { useUIStore } from "../store/ui.store";
import { useAuthStore } from "../store/auth.store";
import { useLogout } from "../features/auth/hooks/useAuth";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../components/ui/dropdown-menu";

export function Header() {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 shrink-0">
      {/* Left */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell placeholder */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/employees/me" className="cursor-pointer">
                <User size={14} className="mr-2" /> My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/change-password" className="cursor-pointer">
                <KeyRound size={14} className="mr-2" /> Change Password
              </Link>
            </DropdownMenuItem>

            {/* Theme submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === "dark" ? (
                  <Moon size={14} className="mr-2" />
                ) : theme === "light" ? (
                  <Sun size={14} className="mr-2" />
                ) : (
                  <Monitor size={14} className="mr-2" />
                )}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun size={14} className="mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon size={14} className="mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor size={14} className="mr-2" /> System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut size={14} className="mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
