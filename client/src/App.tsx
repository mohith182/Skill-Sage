import { useState, useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { User as FirebaseUser } from "firebase/auth";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/firebase";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Interview from "@/pages/Interview";
import Resume from "@/pages/Resume";
import Jobs from "@/pages/Jobs";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

// Admin pages
import {
  AdminDashboard,
  UserManagement,
  ContentManagement,
  ActivityLogs,
  AdminSettings,
} from "@/pages/admin";

// Types
type UserRole = "admin" | "user" | "student" | "mentor";

interface UserData {
  id: string;
  role: UserRole;
  isActive: boolean;
}

function Router() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Fetch user data from database
  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const data = await fetchUserData(firebaseUser.uid);
        // Redirect admin users to admin dashboard
        if (data?.role === "admin" && window.location.pathname === "/") {
          setLocation("/admin");
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  const isAdmin = userData?.role === "admin";

  // Protected route component
  const ProtectedRoute = ({ 
    children, 
    adminOnly = false 
  }: { 
    children: React.ReactNode; 
    adminOnly?: boolean;
  }) => {
    if (!user) {
      return <Login onUserChange={setUser} />;
    }
    
    if (adminOnly && !isAdmin) {
      return <Redirect to="/" />;
    }
    
    return <>{children}</>;
  };

  return (
    <Switch>
      {/* User Routes */}
      <Route path="/">
        {user ? <Dashboard user={user} /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/courses">
        {user ? <Courses user={user} /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/interview">
        {user ? <Interview user={user} /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/resume">
        {user ? <Resume user={user} /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/jobs">
        {user ? <Jobs user={user} /> : <Login onUserChange={setUser} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute adminOnly>
          {user && <AdminDashboard user={user} />}
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute adminOnly>
          {user && <UserManagement user={user} />}
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content">
        <ProtectedRoute adminOnly>
          {user && <ContentManagement user={user} />}
        </ProtectedRoute>
      </Route>
      <Route path="/admin/logs">
        <ProtectedRoute adminOnly>
          {user && <ActivityLogs user={user} />}
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute adminOnly>
          {user && <AdminSettings user={user} />}
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;