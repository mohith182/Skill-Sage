import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock, ExternalLink, BookOpen, Sparkles } from "lucide-react";
import { Course } from "@shared/schema";
import { Link } from "wouter";

interface CourseRecommendationsProps {
  userId: string;
}

export function CourseRecommendations({ userId }: CourseRecommendationsProps) {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses/recommended", userId],
  });

  const handleCourseEnroll = (courseTitle: string) => {
    const searchQuery = encodeURIComponent(courseTitle);
    window.open(`https://www.coursera.org/search?query=${searchQuery}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 p-4 border border-border rounded-lg">
                <div className="h-32 bg-muted rounded-md animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Recommended Courses</CardTitle>
          </div>
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-sm font-medium h-8">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="relative overflow-hidden h-32">
                <img
                  src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.isRecommended && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded-md">
                    <Sparkles className="h-3 w-3" />
                    AI Pick
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`status-badge ${
                    course.difficulty === 'Beginner' ? 'status-success' :
                    course.difficulty === 'Intermediate' ? 'status-warning' :
                    'status-info'
                  }`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-xs font-medium text-foreground">
                      {course.rating ? (course.rating / 10).toFixed(1) : "4.8"}
                    </span>
                  </div>
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">{course.duration}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs font-medium"
                    onClick={() => handleCourseEnroll(course.title)}
                  >
                    Enroll
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
