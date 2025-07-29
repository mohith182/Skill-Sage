import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Course } from "@shared/schema";

interface CourseRecommendationsProps {
  userId: string;
}

export function CourseRecommendations({ userId }: CourseRecommendationsProps) {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended", userId],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-32 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neutral-800">Recommended Courses</h3>
        <Button variant="ghost" className="text-primary hover:text-blue-600 text-sm font-medium">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              src={course.imageUrl || "https://via.placeholder.com/400x200"}
              alt={course.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full font-medium">
                {course.isRecommended ? "AI Recommended" : "Popular"}
              </span>
              <div className="flex items-center text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-xs ml-1 text-neutral-600">
                  {course.rating ? (course.rating / 10).toFixed(1) : "4.8"}
                </span>
              </div>
            </div>
            <h4 className="font-semibold text-neutral-800 mb-2">{course.title}</h4>
            <p className="text-sm text-neutral-600 mb-3">{course.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                {course.duration} • {course.difficulty}
              </span>
              <Button variant="ghost" className="text-primary text-sm font-medium hover:text-blue-600">
                Enroll
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
