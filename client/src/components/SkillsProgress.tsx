import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { SkillProgress } from "@shared/schema";

interface SkillsProgressProps {
  userId: string;
}

const defaultSkills = [
  { name: "Python", progress: 85 },
  { name: "Machine Learning", progress: 70 },
  { name: "Data Visualization", progress: 60 },
  { name: "SQL", progress: 45 },
];

export function SkillsProgress({ userId }: SkillsProgressProps) {
  const { data: skills = [], isLoading } = useQuery<SkillProgress[]>({
    queryKey: ["/api/skills", userId],
  });

  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-primary";
    if (progress >= 60) return "bg-primary/80";
    if (progress >= 40) return "bg-primary/60";
    return "bg-primary/40";
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 80) return "Expert";
    if (progress >= 60) return "Advanced";
    if (progress >= 40) return "Intermediate";
    return "Beginner";
  };

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-2 bg-muted rounded animate-pulse"></div>
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
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-semibold">Skills Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displaySkills.map((skill, index) => (
          <div key={`skill-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {'skillName' in skill ? skill.skillName : skill.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {getProgressLabel(skill.progress || 0)}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {skill.progress}%
                </span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${getProgressColor(skill.progress || 0)}`}
                style={{ width: `${skill.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          className="w-full mt-4 h-9 text-sm font-medium"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
