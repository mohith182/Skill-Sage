import { User as FirebaseUser } from "firebase/auth";
import { logout } from "@/lib/firebase";
import { 
  LayoutDashboard, 
  Users,
  BookOpen,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Bell,
  Home
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminNavigationProps {
  user: FirebaseUser | null;
}

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Content", href: "/admin/content", icon: BookOpen },
  { name: "Logs", href: "/admin/logs", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNavigation({ user }: AdminNavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/admin" && location === "/admin") return true;
    if (path !== "/admin" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="section-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">SkillSage</span>
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`
                      group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium 
                      transition-all duration-150 ease-out
                      ${active 
                        ? 'bg-primary text-white' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className={`icon-sm transition-transform duration-150 group-hover:scale-110`} />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Back to User View */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <Home className="icon-sm mr-2" />
                User View
              </Button>
            </Link>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 relative">
              <Bell className="icon-sm" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 text-slate-300 hover:text-white hover:bg-slate-800">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/50">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {(user.displayName || user.email || "A")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                      {user.displayName || user.email?.split("@")[0] || "Admin"}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.displayName || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">Administrator</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/">
                    <DropdownMenuItem className="cursor-pointer">
                      <Home className="icon-sm mr-2" />
                      Switch to User View
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="icon-sm mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="icon-sm" /> : <Menu className="icon-sm" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate-800">
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium 
                        transition-colors duration-150
                        ${active 
                          ? 'bg-primary text-white' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="icon-sm" />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
