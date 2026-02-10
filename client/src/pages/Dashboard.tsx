import { User as FirebaseUser } from "firebase/auth";
import { Navigation } from "@/components/Navigation";
import AIMentorChat from "@/components/AIMentorChat";
import { CourseRecommendations } from "@/components/CourseRecommendations";
import { InterviewSimulator } from "@/components/InterviewSimulator";
import { SkillsProgress } from "@/components/SkillsProgress";
import { CareerTracker } from "@/components/CareerTracker";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Mic, 
  FileText, 
  TrendingUp,
  BookOpen,
  Briefcase,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface DashboardProps {
  user: FirebaseUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const userId = user.uid;
  const userName = user.displayName?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="section-container py-8">
        {/* Page Header */}
        <div className="page-header">
          <h1>Welcome back, {userName}</h1>
          <p>Here's what's happening with your career journey today.</p>
        </div>

        {/* Quick Stats - 3D Floating Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="group rounded-xl p-5 transition-all duration-500 cursor-pointer" style={{
            background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.7) 0%, hsla(230, 30%, 12%, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsla(185, 100%, 50%, 0.15)',
            boxShadow: '0 8px 32px hsla(230, 50%, 5%, 0.4), inset 0 1px 0 hsla(185, 100%, 80%, 0.1)',
            transform: 'translateY(0)',
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Skills Tracked</p>
                <p className="text-3xl font-bold text-white" style={{ textShadow: '0 0 20px hsla(185, 100%, 50%, 0.4)' }}>12</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsla(185, 100%, 50%, 0.2), hsla(185, 100%, 50%, 0.1))',
                boxShadow: '0 0 25px hsla(185, 100%, 50%, 0.4)'
              }}>
                <TrendingUp className="w-6 h-6 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px hsl(185, 100%, 50%))' }} />
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-5 transition-all duration-500 cursor-pointer" style={{
            background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.7) 0%, hsla(230, 30%, 12%, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsla(280, 100%, 60%, 0.15)',
            boxShadow: '0 8px 32px hsla(230, 50%, 5%, 0.4), inset 0 1px 0 hsla(280, 100%, 80%, 0.1)',
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Courses Enrolled</p>
                <p className="text-3xl font-bold text-white" style={{ textShadow: '0 0 20px hsla(280, 100%, 60%, 0.4)' }}>4</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsla(280, 100%, 60%, 0.2), hsla(280, 100%, 60%, 0.1))',
                boxShadow: '0 0 25px hsla(280, 100%, 60%, 0.4)'
              }}>
                <BookOpen className="w-6 h-6 text-purple-400" style={{ filter: 'drop-shadow(0 0 8px hsl(280, 100%, 60%))' }} />
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-5 transition-all duration-500 cursor-pointer" style={{
            background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.7) 0%, hsla(230, 30%, 12%, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsla(152, 100%, 50%, 0.15)',
            boxShadow: '0 8px 32px hsla(230, 50%, 5%, 0.4), inset 0 1px 0 hsla(152, 100%, 80%, 0.1)',
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Interviews Done</p>
                <p className="text-3xl font-bold text-white" style={{ textShadow: '0 0 20px hsla(152, 100%, 50%, 0.4)' }}>8</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsla(152, 100%, 50%, 0.2), hsla(152, 100%, 50%, 0.1))',
                boxShadow: '0 0 25px hsla(152, 100%, 50%, 0.4)'
              }}>
                <Mic className="w-6 h-6 text-emerald-400" style={{ filter: 'drop-shadow(0 0 8px hsl(152, 100%, 50%))' }} />
              </div>
            </div>
          </div>

          <div className="group rounded-xl p-5 transition-all duration-500 cursor-pointer" style={{
            background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.7) 0%, hsla(230, 30%, 12%, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsla(38, 100%, 55%, 0.15)',
            boxShadow: '0 8px 32px hsla(230, 50%, 5%, 0.4), inset 0 1px 0 hsla(38, 100%, 80%, 0.1)',
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Jobs Applied</p>
                <p className="text-3xl font-bold text-white" style={{ textShadow: '0 0 20px hsla(38, 100%, 55%, 0.4)' }}>23</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsla(38, 100%, 55%, 0.2), hsla(38, 100%, 55%, 0.1))',
                boxShadow: '0 0 25px hsla(38, 100%, 55%, 0.4)'
              }}>
                <Briefcase className="w-6 h-6 text-amber-400" style={{ filter: 'drop-shadow(0 0 8px hsl(38, 100%, 55%))' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Neon Buttons */}
        <div className="rounded-xl p-6 mb-8" style={{
          background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.7) 0%, hsla(230, 30%, 12%, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid hsla(185, 100%, 50%, 0.15)',
          boxShadow: '0 8px 32px hsla(230, 50%, 5%, 0.4)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{
            background: 'linear-gradient(135deg, hsl(185, 100%, 60%), hsl(280, 100%, 70%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/interview">
              <div className="group p-4 rounded-xl transition-all duration-300 cursor-pointer" style={{
                background: 'linear-gradient(135deg, hsla(185, 50%, 20%, 0.3), hsla(185, 50%, 15%, 0.2))',
                border: '1px solid hsla(185, 100%, 50%, 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                    background: 'hsla(185, 100%, 50%, 0.15)',
                    boxShadow: '0 0 15px hsla(185, 100%, 50%, 0.3)'
                  }}>
                    <Mic className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px hsl(185, 100%, 50%))' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Mock Interview</p>
                    <p className="text-xs text-gray-400">Practice with AI</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/resume">
              <div className="group p-4 rounded-xl transition-all duration-300 cursor-pointer" style={{
                background: 'linear-gradient(135deg, hsla(280, 50%, 20%, 0.3), hsla(280, 50%, 15%, 0.2))',
                border: '1px solid hsla(280, 100%, 60%, 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                    background: 'hsla(280, 100%, 60%, 0.15)',
                    boxShadow: '0 0 15px hsla(280, 100%, 60%, 0.3)'
                  }}>
                    <FileText className="w-5 h-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 6px hsl(280, 100%, 60%))' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Resume Tools</p>
                    <p className="text-xs text-gray-400">Build & analyze</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/courses">
              <div className="group p-4 rounded-xl transition-all duration-300 cursor-pointer" style={{
                background: 'linear-gradient(135deg, hsla(152, 50%, 20%, 0.3), hsla(152, 50%, 15%, 0.2))',
                border: '1px solid hsla(152, 100%, 50%, 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                    background: 'hsla(152, 100%, 50%, 0.15)',
                    boxShadow: '0 0 15px hsla(152, 100%, 50%, 0.3)'
                  }}>
                    <BookOpen className="w-5 h-5 text-emerald-400" style={{ filter: 'drop-shadow(0 0 6px hsl(152, 100%, 50%))' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Browse Courses</p>
                    <p className="text-xs text-gray-400">Learn new skills</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/jobs">
              <div className="group p-4 rounded-xl transition-all duration-300 cursor-pointer" style={{
                background: 'linear-gradient(135deg, hsla(38, 50%, 20%, 0.3), hsla(38, 50%, 15%, 0.2))',
                border: '1px solid hsla(38, 100%, 55%, 0.2)',
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{
                    background: 'hsla(38, 100%, 55%, 0.15)',
                    boxShadow: '0 0 15px hsla(38, 100%, 55%, 0.3)'
                  }}>
                    <Briefcase className="w-5 h-5 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px hsl(38, 100%, 55%))' }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">Find Jobs</p>
                    <p className="text-xs text-gray-400">Explore opportunities</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Mentor Chat - Premium Glow */}
            <div className="rounded-xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, hsla(230, 30%, 18%, 0.8) 0%, hsla(230, 30%, 12%, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid hsla(185, 100%, 50%, 0.2)',
              boxShadow: '0 15px 50px hsla(230, 50%, 5%, 0.5), 0 0 40px hsla(185, 100%, 50%, 0.1)'
            }}>
              <div className="p-5 border-b" style={{ borderColor: 'hsla(185, 100%, 50%, 0.1)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, hsl(185, 100%, 50%), hsl(280, 100%, 60%))',
                      boxShadow: '0 0 25px hsla(185, 100%, 50%, 0.5)'
                    }}>
                      <Sparkles className="h-5 w-5 text-white" style={{ filter: 'drop-shadow(0 0 8px white)' }} />
                    </div>
                    <span className="text-lg font-semibold" style={{
                      background: 'linear-gradient(135deg, hsl(185, 100%, 60%), hsl(280, 100%, 70%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>AI Career Mentor</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                    background: 'hsla(152, 100%, 45%, 0.2)',
                    color: 'hsl(152, 100%, 60%)',
                    border: '1px solid hsla(152, 100%, 45%, 0.4)',
                    boxShadow: '0 0 15px hsla(152, 100%, 45%, 0.3)',
                    animation: 'pulseGlow 2s ease-in-out infinite'
                  }}>Online</span>
                </div>
              </div>
              <div className="p-5">
                <AIMentorChat userId={userId} />
              </div>
            </div>

            {/* Course Recommendations */}
            <CourseRecommendations userId={userId} />

            {/* Interview Simulator Preview */}
            <InterviewSimulator userId={userId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SkillsProgress userId={userId} />
            <CareerTracker userId={userId} />
            <RecentActivity userId={userId} />
          </div>
        </div>
      </main>
    </div>
  );
}