import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

export type UserRole = "admin" | "user" | "student" | "mentor";

interface UserData {
  id: string;
  email: string;
  name: string;
  photoURL: string | null;
  role: UserRole;
  isActive: boolean;
  credits: number;
  internshipHours: number;
  certificates: number;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/${uid}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userData?.role === "admin";
  const isUser = userData?.role === "user" || userData?.role === "student";

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userData,
        loading,
        isAdmin,
        isUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
