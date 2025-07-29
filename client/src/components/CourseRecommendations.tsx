import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Course } from "@shared/schema";
import { Link } from "wouter";

interface CourseRecommendationsProps {
  userId: string;
}

export function CourseRecommendations({ userId }: CourseRecommendationsProps) {
  const { data: courses = [], isLoading, refetch } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended", userId],
  });

  const handleCourseEnroll = (courseTitle: string) => {
    const message = `You'll be redirected to Coursera to find "${courseTitle}". Note that some courses may require payment.`;
    
    if (confirm(message)) {
      const searchQuery = encodeURIComponent(courseTitle);
      window.open(`https://www.coursera.org/search?query=${searchQuery}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-40 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
                <div className="h-8 bg-neutral-200 rounded"></div>
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
        <Link href="/courses">
          <Button variant="ghost" className="text-primary hover:text-blue-600 text-sm font-medium">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group border border-neutral-200 rounded-xl p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img
                src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"}
                alt={course.title}
                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                course.isRecommended 
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary" 
                  : "bg-accent/10 text-accent"
              }`}>
                {course.isRecommended ? "🤖 AI Pick" : "🔥 Popular"}
              </span>
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm ml-1 text-neutral-600 font-medium">
                  {course.rating ? (course.rating / 10).toFixed(1) : "4.8"}
                </span>
              </div>
            </div>
            <h4 className="font-bold text-neutral-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h4>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{course.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500 space-y-1">
                <div>📅 {course.duration}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.difficulty}
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                onClick={() => handleCourseEnroll(course.title)}
              >
                Find on Coursera
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
