import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Briefcase, Award } from "lucide-react";
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
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-100 rounded-xl p-4">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-neutral-200 rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const credits = user?.credits || 24;
  const internshipHours = user?.internshipHours || 320;
  const certificates = user?.certificates || 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-6">Career Tracker</h3>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-accent/10 to-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Course Credits</span>
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">{credits}</div>
          <div className="text-xs text-neutral-600">of 36 required</div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Internship Hours</span>
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{internshipHours}</div>
          <div className="text-xs text-neutral-600">hours completed</div>
        </div>

        <div className="bg-gradient-to-r from-secondary/10 to-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Certificates</span>
            <Award className="h-5 w-5 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-secondary">{certificates}</div>
          <div className="text-xs text-neutral-600">earned this year</div>
        </div>
      </div>
    </div>
  );
}
