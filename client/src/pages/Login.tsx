import { useEffect } from "react";
import { useLocation } from "wouter";
import { User as FirebaseUser } from "firebase/auth";
import { useMutation } from "@tanstack/react-query";
import { login, handleRedirect, auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onUserChange: (user: FirebaseUser | null) => void;
}

export default function Login({ onUserChange }: LoginProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user?.uid ? "User logged in" : "No user");
      if (user) {
        onUserChange(user);
        
        // Check if user exists in our database, create if not
        try {
          console.log("Checking if user exists in database...");
          await apiRequest("GET", `/api/user/${user.uid}`);
          console.log("User exists in database");
        } catch (error) {
          console.log("User doesn't exist, creating new user...");
          // User doesn't exist, create them
          await createUserMutation.mutateAsync({
            email: user.email,
            name: user.displayName || "User",
            photoURL: user.photoURL,
            role: "student",
          });
          console.log("New user created");
        }
        
        console.log("Redirecting to dashboard...");
        setLocation("/");
      }
    });

    // Handle redirect result
    handleRedirect().then((result) => {
      console.log("Redirect result:", result?.user?.uid ? "User found" : "No user");
      if (result?.user) {
        console.log("Login successful via redirect");
        toast({
          title: "Welcome to SkillSage!",
          description: "You've successfully logged in.",
        });
      }
    }).catch((error) => {
      console.error("Login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: "Domain Authorization Required",
          description: "Please add your Replit domain to Firebase authorized domains.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Error", 
          description: `Failed to log in: ${error.message}`,
          variant: "destructive",
        });
      }
    });

    return () => unsubscribe();
  }, [onUserChange, setLocation, toast, createUserMutation]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-800">
            Welcome to SkillSage
          </CardTitle>
          <p className="text-neutral-600">
            Your AI-powered career mentor and learning navigator
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>AI-powered career guidance</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Mock interview simulator</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Personalized course recommendations</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Skills progress tracking</span>
            </div>
          </div>
          
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            size="lg"
          >
            <i className="fab fa-google mr-2"></i>
            Continue with Google
          </Button>
          
          <p className="text-xs text-neutral-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
