import { User as FirebaseUser } from "firebase/auth";
import { logout } from "@/lib/firebase";
import { Bell, ChevronDown, Home, BookOpen, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  user: FirebaseUser | null;
}

export function Navigation({ user }: NavigationProps) {
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                <i className="fas fa-brain text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-neutral-800">SkillSage</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-8">
            {[
              { name: "Dashboard", href: "/" },
              { name: "Courses", href: "/courses" },
              { name: "Interview", href: "/interview" },
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <span className="text-neutral-600 hover:text-primary transition-colors duration-200 font-medium cursor-pointer">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <img 
                      src={user.photoURL || "https://via.placeholder.com/32"} 
                      alt="User profile" 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium text-neutral-700">
                      {user.displayName || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}