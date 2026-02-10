import { ReactNode } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Redirect } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { firebaseUser, userData, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!firebaseUser) {
    return <Redirect to="/login" />;
  }

  // Check role permissions if specified
  if (allowedRoles && userData) {
    const hasPermission = allowedRoles.includes(userData.role);
    
    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-muted-foreground">
                Required role: <span className="font-medium text-foreground">{allowedRoles.join(" or ")}</span>
              </p>
              <Link href={redirectTo}>
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Higher-order component for admin-only routes
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]} redirectTo="/">
      {children}
    </ProtectedRoute>
  );
}

// Higher-order component for user-only routes (non-admin)
export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["user", "student", "mentor"]} redirectTo="/admin">
      {children}
    </ProtectedRoute>
  );
}
