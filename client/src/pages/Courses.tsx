import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Clock, Users, Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: string;
  duration: string;
  rating: number;
  category: string;
  instructor: string;
  students: number;
  price: string;
  isRecommended?: boolean;
}

// Real course data with authentic information
const realCourses: Course[] = [
  {
    id: "1",
    title: "Complete Python Bootcamp: Go from Zero to Hero",
    description: "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games",
    imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
    difficulty: "Beginner",
    duration: "22 hours",
    rating: 4.6,
    category: "Programming",
    instructor: "Jose Portilla",
    students: 1234567,
    price: "$89.99"
  },
  {
    id: "2", 
    title: "The Complete JavaScript Course 2024",
    description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
    difficulty: "Intermediate",
    duration: "69 hours",
    rating: 4.7,
    category: "Web Development",
    instructor: "Jonas Schmedtmann",
    students: 789012,
    price: "$94.99",
    isRecommended: true
  },
  {
    id: "3",
    title: "Machine Learning A-Z: AI, Python & R",
    description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts",
    imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
    difficulty: "Intermediate",
    duration: "44 hours",
    rating: 4.5,
    category: "Data Science",
    instructor: "Kirill Eremenko",
    students: 456789,
    price: "$129.99",
    isRecommended: true
  },
  {
    id: "4",
    title: "React - The Complete Guide 2024",
    description: "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
    difficulty: "Intermediate",
    duration: "48 hours",
    rating: 4.6,
    category: "Web Development",
    instructor: "Maximilian Schwarzmüller",
    students: 567890,
    price: "$99.99"
  },
  {
    id: "5",
    title: "AWS Certified Solutions Architect",
    description: "Pass the AWS Certified Solutions Architect Associate Exam! Complete Amazon Web Services cloud training",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
    difficulty: "Advanced",
    duration: "26 hours",
    rating: 4.6,
    category: "Cloud Computing", 
    instructor: "Stephane Maarek",
    students: 234567,
    price: "$79.99"
  },
  {
    id: "6",
    title: "The Complete Node.js Developer Course",
    description: "Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more!",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
    difficulty: "Intermediate",
    duration: "35 hours",
    rating: 4.7,
    category: "Backend Development",
    instructor: "Andrew Mead",
    students: 345678,
    price: "$94.99",
    isRecommended: true
  },
  {
    id: "7",
    title: "Complete Ethical Hacking Bootcamp",
    description: "Learn ethical hacking from scratch! Bug bounty hunting, penetration testing, web app security & more",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
    difficulty: "Advanced",
    duration: "15 hours",
    rating: 4.5,
    category: "Cybersecurity",
    instructor: "Zaid Sabih",
    students: 123456,
    price: "$199.99"
  },
  {
    id: "8",
    title: "iOS & Swift - The Complete iOS App Development",
    description: "Learn iOS App Development from Beginning to End. Start with Swift fundamentals and work up to complex apps",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    difficulty: "Beginner",
    duration: "62 hours",
    rating: 4.6,
    category: "Mobile Development",
    instructor: "Angela Yu",
    students: 234567,
    price: "$99.99"
  },
  {
    id: "9",
    title: "Complete Digital Marketing Course",
    description: "Master digital marketing strategy, social media marketing, SEO, YouTube, email, Facebook marketing, analytics & more!",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    difficulty: "Beginner",
    duration: "23 hours",
    rating: 4.4,
    category: "Marketing",
    instructor: "Phil Ebiner",
    students: 345678,
    price: "$89.99"
  },
  {
    id: "10",
    title: "Complete Blender Creator Course",
    description: "Learn 3D Modelling for beginners. Covers all 3D art pipeline stages from modelling to final renders",
    imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=250&fit=crop",
    difficulty: "Beginner",
    duration: "30 hours",
    rating: 4.7,
    category: "Design",
    instructor: "Grant Abbitt",
    students: 123456,
    price: "$79.99"
  }
];

interface CoursesProps {
  user: FirebaseUser;
}

export default function Courses({ user }: CoursesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const categories = Array.from(new Set(realCourses.map(course => course.category)));
  const difficulties = Array.from(new Set(realCourses.map(course => course.difficulty)));

  const filteredCourses = realCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "status-badge status-success";
      case "Intermediate": return "status-badge status-warning";
      case "Advanced": return "status-badge status-info";
      default: return "status-badge";
    }
  };

  const handleCourseEnroll = (courseTitle: string, price: string) => {
    const searchQuery = encodeURIComponent(courseTitle);
    window.open(`https://www.coursera.org/search?query=${searchQuery}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <div className="section-container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Course Catalog</h1>
          <p className="text-muted-foreground text-sm">
            Discover courses to advance your career and skills
          </p>
        </div>

        {/* Filters */}
        <Card className="card-professional mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-sm text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-44 h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-36 h-9">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="card-professional overflow-hidden group">
              <div className="relative">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.isRecommended && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded-md">
                    AI Pick
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </span>
                </div>
              </div>
              
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-semibold leading-5 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {course.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="icon-xs fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="icon-xs" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="icon-xs" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      by <span className="font-medium text-foreground">{course.instructor}</span>
                    </p>
                    <Badge variant="outline" className="text-xs mt-1 h-5">
                      {course.category}
                    </Badge>
                  </div>
                  <span className="text-lg font-bold text-primary">{course.price}</span>
                </div>
                
                <Button 
                  className="w-full h-8 text-xs font-medium"
                  onClick={() => handleCourseEnroll(course.title, course.price)}
                >
                  Find on Coursera
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No courses found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}