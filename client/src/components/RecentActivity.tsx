import { useQuery } from "@tanstack/react-query";
import { Check, Star, MessageCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@shared/schema";

interface RecentActivityProps {
  userId: string;
}

const defaultActivities = [
  {
    id: "1",
    type: "course_completed",
    description: 'Completed "Python Basics" course',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2", 
    type: "certificate_earned",
    description: 'Earned "Data Analysis" certificate',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "chat_session",
    description: "AI mentor session completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export function RecentActivity({ userId }: RecentActivityProps) {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities", userId],
  });

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "course_completed":
        return { icon: Check, color: "text-emerald-600", bgColor: "bg-emerald-50" };
      case "certificate_earned":
        return { icon: Star, color: "text-amber-600", bgColor: "bg-amber-50" };
      case "chat_session":
        return { icon: MessageCircle, color: "text-primary", bgColor: "bg-primary/10" };
      default:
        return { icon: Check, color: "text-muted-foreground", bgColor: "bg-muted" };
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "Just now";
    const activityDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayActivities.slice(0, 3).map((activity) => {
          const { icon: Icon, color, bgColor } = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground leading-tight">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(activity.createdAt || undefined)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
