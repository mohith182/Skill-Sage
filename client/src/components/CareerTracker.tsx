import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Briefcase, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";

interface CareerTrackerProps {
  userId: string;
}

export function CareerTracker({ userId }: CareerTrackerProps) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user", userId],
  });

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const credits = user?.credits || 24;
  const internshipHours = user?.internshipHours || 320;
  const certificates = user?.certificates || 7;

  const trackerItems = [
    {
      label: "Course Credits",
      value: credits,
      subtext: "of 36 required",
      progress: Math.round((credits / 36) * 100),
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Internship Hours",
      value: internshipHours,
      subtext: "hours completed",
      progress: Math.min(100, Math.round((internshipHours / 500) * 100)),
      icon: Briefcase,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Certificates",
      value: certificates,
      subtext: "earned this year",
      progress: Math.min(100, Math.round((certificates / 10) * 100)),
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Career Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {trackerItems.map((item) => (
          <div key={item.label} className="p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.subtext}</span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${item.bgColor.replace('/10', '').replace('/50', '')} ${item.color.replace('text-', 'bg-')}`}
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
