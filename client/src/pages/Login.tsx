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
            firebaseUid: user.uid,
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, hsl(230, 35%, 7%) 0%, hsl(260, 40%, 12%) 50%, hsl(230, 35%, 7%) 100%)'
    }}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
          background: 'radial-gradient(circle, hsla(185, 100%, 50%, 0.15) 0%, transparent 70%)'
        }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
          background: 'radial-gradient(circle, hsla(280, 100%, 50%, 0.15) 0%, transparent 70%)',
          animationDelay: '1s'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, hsla(320, 100%, 50%, 0.08) 0%, transparent 60%)'
        }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Login Card */}
        <div className="rounded-2xl p-8 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.8) 0%, hsla(230, 30%, 12%, 0.7) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid hsla(185, 100%, 50%, 0.2)',
          boxShadow: '0 25px 80px hsla(230, 50%, 5%, 0.6), 0 0 60px hsla(185, 100%, 50%, 0.1), 0 0 120px hsla(280, 100%, 50%, 0.05)'
        }}>
          {/* Rotating Glow Border */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute -inset-[200%] animate-spin" style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, hsla(185, 100%, 50%, 0.15) 60deg, transparent 120deg, hsla(280, 100%, 60%, 0.15) 180deg, transparent 240deg, hsla(185, 100%, 50%, 0.15) 300deg, transparent 360deg)',
              animationDuration: '8s'
            }}></div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4 pb-6 relative">
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center relative" style={{
              background: 'linear-gradient(135deg, hsl(185, 100%, 50%) 0%, hsl(280, 100%, 60%) 100%)',
              boxShadow: '0 0 40px hsla(185, 100%, 50%, 0.6), 0 0 80px hsla(185, 100%, 50%, 0.3)'
            }}>
              <Brain className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 0 10px white)' }} />
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-2xl animate-ping" style={{
                background: 'linear-gradient(135deg, hsla(185, 100%, 50%, 0.3), hsla(280, 100%, 60%, 0.3))',
                animationDuration: '2s'
              }}></div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold" style={{
                background: 'linear-gradient(135deg, hsl(185, 100%, 60%) 0%, hsl(280, 100%, 70%) 50%, hsl(185, 100%, 60%) 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientText 3s ease-in-out infinite'
              }}>
                Welcome to SkillSage
              </h1>
              <p className="text-gray-400 text-sm">
                Your AI-powered career mentor and learning navigator
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-8 relative">
            {[
              { text: 'AI-powered career guidance', color: 'hsl(185, 100%, 50%)' },
              { text: 'Mock interview simulator', color: 'hsl(280, 100%, 60%)' },
              { text: 'Personalized course recommendations', color: 'hsl(152, 100%, 50%)' },
              { text: 'Resume analysis and optimization', color: 'hsl(38, 100%, 55%)' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300 group transition-all duration-300 hover:translate-x-2">
                <div className="w-2 h-2 rounded-full transition-all duration-300" style={{
                  background: feature.color,
                  boxShadow: `0 0 10px ${feature.color}`
                }}></div>
                <span className="group-hover:text-white transition-colors">{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full h-14 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, hsl(185, 100%, 45%) 0%, hsl(185, 100%, 35%) 100%)',
              boxShadow: '0 4px 20px hsla(185, 100%, 50%, 0.4), 0 0 40px hsla(185, 100%, 50%, 0.2), inset 0 1px 0 hsla(0, 0%, 100%, 0.2)',
              color: 'hsl(230, 35%, 7%)'
            }}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: 'linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.3), transparent)',
              transform: 'translateX(-100%)',
              animation: 'none'
            }}></div>
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-6" style={{
          textShadow: '0 0 20px hsla(185, 100%, 50%, 0.3)'
        }}>
          Powered by AI for smarter career decisions
        </p>
      </div>
    </div>
  );
}
