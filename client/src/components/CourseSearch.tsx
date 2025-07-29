
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseSearchProps {
  userId: string;
}

interface CourseSearchResult {
  course?: {
    id: string;
    title: string;
    description: string;
    price: string;
    difficulty: string;
    category: string;
    duration: string;
  };
  courses?: Array<{
    id: string;
    title: string;
    description: string;
    price: string;
    difficulty: string;
    category: string;
    duration: string;
    courseraUrl: string;
    isPaid: boolean;
    pricingInfo: string;
  }>;
  courseraUrl: string;
  isPaid: boolean;
  pricingInfo: string;
  count?: number;
  searchTerm?: string;
}

export function CourseSearch({ userId }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<CourseSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a course name",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // First try to find multiple courses
      const multiResponse = await fetch(`/api/courses/search-multiple/${encodeURIComponent(searchQuery)}`);
      const multiData = await multiResponse.json();
      
      if (multiResponse.ok && multiData.courses && multiData.courses.length > 0) {
        setSearchResult(multiData);
        toast({
          title: `Found ${multiData.count} course${multiData.count !== 1 ? 's' : ''}!`,
          description: `Showing results for "${searchQuery}"`,
        });
        return;
      }

      // If no multiple results, try single course search
      const singleResponse = await fetch(`/api/courses/search/${encodeURIComponent(searchQuery)}`);
      const singleData = await singleResponse.json();
      
      if (singleResponse.ok) {
        setSearchResult(singleData);
        toast({
          title: "Course found!",
          description: singleData.course ? "Course details loaded" : "Redirecting to Coursera search",
        });
      } else {
        setSearchResult(singleData);
        toast({
          title: "Course not found in our database",
          description: "But we'll help you find it on Coursera!",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseraRedirect = (url: string) => {
    const message = searchResult?.isPaid 
      ? `${searchResult.pricingInfo}. You'll be redirected to Coursera to enroll.`
      : "You'll be redirected to Coursera to find this course.";
    
    if (confirm(message)) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search for Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter course name (e.g., Python, JavaScript, Machine Learning)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="bg-primary hover:bg-primary/90"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {searchResult && (
          <div className="space-y-4">
            {searchResult.courses && searchResult.courses.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-neutral-800">
                    Found {searchResult.count} course{searchResult.count !== 1 ? 's' : ''} for "{searchResult.searchTerm}"
                  </h4>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResult.courses.map((course, index) => (
                    <Card key={course.id || index} className="border-primary/20">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h5 className="font-semibold text-base line-clamp-2">{course.title}</h5>
                            <Badge variant={course.isPaid ? "destructive" : "secondary"}>
                              {course.isPaid ? "Paid" : "Free"}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-2">{course.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">{course.category}</Badge>
                            <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                            <Badge variant="outline" className="text-xs">{course.duration}</Badge>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3" />
                              <span className="text-sm font-medium">{course.pricingInfo}</span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleCourseraRedirect(course.courseraUrl)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Coursera
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : searchResult.course ? (
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-lg">{searchResult.course.title}</h4>
                      <Badge variant={searchResult.isPaid ? "destructive" : "secondary"}>
                        {searchResult.isPaid ? "Paid" : "Free"}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600">{searchResult.course.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{searchResult.course.category}</Badge>
                      <Badge variant="outline">{searchResult.course.difficulty}</Badge>
                      <Badge variant="outline">{searchResult.course.duration}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{searchResult.pricingInfo}</span>
                      </div>
                      <Button 
                        onClick={() => handleCourseraRedirect(searchResult.courseraUrl)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Find on Coursera
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-yellow-800">Course not found in our database</h4>
                    <p className="text-sm text-yellow-700">
                      Don't worry! We'll help you search for "{searchQuery}" on Coursera.
                    </p>
                    <Button 
                      onClick={() => handleCourseraRedirect(searchResult.courseraUrl)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Search on Coursera
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
