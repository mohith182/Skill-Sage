import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

  // Use default skills if no data
  const displaySkills = skills.length > 0 ? skills : defaultSkills;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-gradient-to-r from-primary to-blue-400";
    if (progress >= 60) return "bg-gradient-to-r from-secondary to-purple-400";
    if (progress >= 40) return "bg-gradient-to-r from-accent to-green-400";
    return "bg-gradient-to-r from-yellow-400 to-orange-400";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-2 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-6">Skills Progress</h3>
      
      <div className="space-y-4">
        {displaySkills.map((skill, index) => (
          <div key={`skill-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">
                {'skillName' in skill ? skill.skillName : skill.name}
              </span>
              <span className="text-sm text-neutral-500">
                {skill.progress}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor(skill.progress || 0)}`}
                style={{ width: `${skill.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <Button
        variant="secondary"
        className="w-full mt-6 bg-neutral-100 text-neutral-700 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
      >
        View Detailed Analytics
      </Button>
    </div>
  );
}
