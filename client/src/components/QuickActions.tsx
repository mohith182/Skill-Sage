import { Button } from "@/components/ui/button";
import { CalendarPlus, FileText, Search, BookOpen, Target, TrendingUp, Award, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export function QuickActions() {
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  const actions = [
    {
      icon: CalendarPlus,
      title: "Schedule Session",
      description: "Book 1-on-1 mentoring",
      bgColor: "bg-gradient-to-br from-blue-100 to-primary/10",
      iconColor: "text-primary",
      href: "/schedule",
      comingSoon: true,
    },
    {
      icon: FileText,
      title: "Resume Review",
      description: "AI-powered feedback",
      bgColor: "bg-gradient-to-br from-green-100 to-accent/10",
      iconColor: "text-accent",
      href: "/resume",
      comingSoon: true,
    },
    {
      icon: Search,
      title: "Job Search",
      description: "Find opportunities",
      bgColor: "bg-gradient-to-br from-purple-100 to-secondary/10",
      iconColor: "text-secondary",
      href: "/jobs",
      comingSoon: true,
    },
    {
      icon: BookOpen,
      title: "Study Plan",
      description: "Personalized learning",
      bgColor: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      href: "/study-plan",
      comingSoon: true,
    },
    {
      icon: Target,
      title: "Goal Tracker",
      description: "Track your progress",
      bgColor: "bg-gradient-to-br from-pink-100 to-pink-200",
      iconColor: "text-pink-600",
      href: "/goals",
      comingSoon: true,
    },
    {
      icon: Award,
      title: "Achievements",
      description: "View your milestones",
      bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      iconColor: "text-yellow-600",
      href: "/achievements",
      comingSoon: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">Quick Actions</h3>
        <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === index;
          
          const ActionContent = (
            <div
              className={`group relative w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 cursor-pointer border-2 border-transparent ${
                isHovered ? 'shadow-lg transform scale-[1.02] border-primary/20' : 'hover:shadow-md hover:border-neutral-200'
              }`}
              onMouseEnter={() => setHoveredAction(index)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div className={`relative w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'transform rotate-6 scale-110' : 'group-hover:scale-105'
              }`}>
                <Icon className={`h-6 w-6 ${action.iconColor} transition-all duration-300 ${
                  isHovered ? 'scale-110' : ''
                }`} />
                {isHovered && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-neutral-800 transition-colors duration-200 ${
                  isHovered ? 'text-primary' : 'group-hover:text-neutral-900'
                }`}>
                  {action.title}
                  {action.comingSoon && (
                    <span className="ml-2 text-xs bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <div className="text-sm text-neutral-500 group-hover:text-neutral-600 transition-colors">
                  {action.description}
                </div>
              </div>
              
              <div className={`transition-all duration-300 ${
                isHovered ? 'transform translate-x-1 opacity-100' : 'opacity-0'
              }`}>
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Animated background */}
              <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>
          );

          return action.comingSoon ? (
            <div key={index} className="relative">
              {ActionContent}
            </div>
          ) : (
            <Link key={index} href={action.href}>
              {ActionContent}
            </Link>
          );
        })}
      </div>
      
      {/* Bottom hint */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-400">
          💡 More features coming soon!
        </p>
      </div>
    </div>
  );
}
