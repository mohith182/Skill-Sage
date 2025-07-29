import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { User as FirebaseUser } from "firebase/auth";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/firebase";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Courses from "@/pages/Courses";
import Interview from "@/pages/Interview";
import NotFound from "@/pages/not-found";

function Router() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <Switch>
      <Route path="/">
        {user ? <Dashboard user={user} /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/courses">
        {user ? <Courses /> : <Login onUserChange={setUser} />}
      </Route>
      <Route path="/interview">
        {user ? <Interview userId={user.uid} /> : <Login onUserChange={setUser} />}
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
