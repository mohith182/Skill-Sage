
import { ResumeDashboard } from "@/components/ResumeDashboard";
import { useUser } from "@/lib/firebase";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";

export default function Resume() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="icon-lg spinner icon-primary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading your resume workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="section-container py-6">
        <ResumeDashboard userId={user.uid} />
      </div>
    </div>
  );
}
