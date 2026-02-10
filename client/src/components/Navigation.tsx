import { User as FirebaseUser } from "firebase/auth";
import { logout } from "@/lib/firebase";
import { 
  LayoutDashboard, 
  BookOpen, 
  Mic, 
  FileText, 
  Briefcase,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Settings
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  user: FirebaseUser | null;
}

interface UserData {
  role: string;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Interview", href: "/interview", icon: Mic },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
];

export function Navigation({ user }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/user/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const isAdmin = userData?.role === "admin";

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
    <header className="sticky top-0 z-50 transition-all duration-300" style={{
      background: 'linear-gradient(90deg, hsla(230, 35%, 12%, 0.85) 0%, hsla(230, 35%, 10%, 0.9) 50%, hsla(230, 35%, 12%, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid hsla(185, 100%, 50%, 0.15)',
      boxShadow: '0 4px 30px hsla(230, 50%, 5%, 0.5), 0 0 60px hsla(185, 100%, 50%, 0.05)'
    }}>
      <div className="section-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Glowing Effect */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
              background: 'linear-gradient(135deg, hsl(185, 100%, 50%) 0%, hsl(280, 100%, 60%) 100%)',
              boxShadow: '0 0 25px hsla(185, 100%, 50%, 0.5), 0 0 50px hsla(185, 100%, 50%, 0.3)'
            }}>
              <svg 
                className="w-6 h-6 text-white drop-shadow-lg" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                />
              </svg>
            </div>
            <span className="text-xl font-bold transition-all duration-300" style={{
              background: 'linear-gradient(135deg, hsl(185, 100%, 60%) 0%, hsl(280, 100%, 70%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>SkillSage</span>
          </Link>

          {/* Desktop Navigation - Neon Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} href={item.href}>
                  <span 
                    className={`
                      group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                      transition-all duration-300 ease-out relative overflow-hidden
                      ${active 
                        ? 'text-cyan-300' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                    style={active ? {
                      background: 'linear-gradient(90deg, hsla(185, 100%, 50%, 0.15), hsla(280, 100%, 50%, 0.1))',
                      boxShadow: '0 0 20px hsla(185, 100%, 50%, 0.2), inset 0 0 20px hsla(185, 100%, 50%, 0.05)',
                      textShadow: '0 0 10px hsla(185, 100%, 50%, 0.7)'
                    } : {}}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${active ? 'drop-shadow-[0_0_8px_hsl(185,100%,50%)]' : 'group-hover:drop-shadow-[0_0_8px_hsl(185,100%,50%)]'}`} />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {(user.displayName || user.email || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                      {user.displayName || user.email?.split("@")[0] || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <Shield className="icon-sm mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="icon-sm mr-2 transition-transform duration-150 group-hover:scale-110" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden icon-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="icon-md" /> : <Menu className="icon-md" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border bg-white animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.name} href={item.href}>
                    <span 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium 
                        transition-all duration-150 ease-out active:scale-[0.98]
                        ${active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className={`icon-sm ${active ? 'text-primary' : ''}`} />
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