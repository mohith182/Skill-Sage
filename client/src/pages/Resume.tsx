
import { ResumeDashboard } from "@/components/ResumeDashboard";
import { useUser } from "@/lib/firebase";
import { Navigation } from "@/components/Navigation";

export default function Resume() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your resume workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <ResumeDashboard userId={user.uid} />
      </div>
    </div>
  );
}
