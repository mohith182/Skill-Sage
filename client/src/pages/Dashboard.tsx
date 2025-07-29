import { User as FirebaseUser } from "firebase/auth";
import { Navigation } from "@/components/Navigation";
import { AIMentorChat } from "@/components/AIMentorChat";
import { CourseRecommendations } from "@/components/CourseRecommendations";
import { InterviewSimulator } from "@/components/InterviewSimulator";
import { SkillsProgress } from "@/components/SkillsProgress";
import { CareerTracker } from "@/components/CareerTracker";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mic } from "lucide-react";
import { Link } from "wouter";

interface DashboardProps {
  user: FirebaseUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const userId = user.uid;
  const userName = user.displayName || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
            <p className="text-blue-100 mb-6">Ready to take your career to the next level? Your AI mentor is here to guide you.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start AI Session
              </Button>
              <Link href="/interview">
                <Button variant="secondary" className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200">
                  <Mic className="mr-2 h-5 w-5" />
                  Mock Interview
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 translate-x-12"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AIMentorChat userId={userId} />
            <CourseRecommendations userId={userId} />
            <InterviewSimulator userId={userId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SkillsProgress userId={userId} />
            <CareerTracker userId={userId} />
            <QuickActions />
            <RecentActivity userId={userId} />
          </div>
        </div>
      </div>

      {/* Floating Action Button for AI Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="w-14 h-14 bg-gradient-to-r from-secondary to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <i className="fas fa-robot text-lg"></i>
        </Button>
      </div>
    </div>
  );
}
