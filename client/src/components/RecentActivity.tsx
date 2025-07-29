import { useQuery } from "@tanstack/react-query";
import { Check, Star, MessageCircle } from "lucide-react";
import { Activity } from "@shared/schema";

interface RecentActivityProps {
  userId: string;
}

const defaultActivities = [
  {
    id: "1",
    type: "course_completed",
    description: 'Completed "Python Basics" course',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "2", 
    type: "certificate_earned",
    description: 'Earned "Data Analysis" certificate',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "3",
    type: "chat_session",
    description: "AI mentor session completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

export function RecentActivity({ userId }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities", userId],
  });

  // Use default activities if no data
  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return { icon: Check, bgColor: "bg-accent", iconColor: "text-white" };
      case "certificate_earned":
        return { icon: Star, bgColor: "bg-primary", iconColor: "text-white" };
      case "chat_session":
        return { icon: MessageCircle, bgColor: "bg-secondary", iconColor: "text-white" };
      default:
        return { icon: Check, bgColor: "bg-neutral-400", iconColor: "text-white" };
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "Just now";
    const activityDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {displayActivities.slice(0, 3).map((activity) => {
          const { icon: Icon, bgColor, iconColor } = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-800">{activity.description}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatTime(activity.createdAt || undefined)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
