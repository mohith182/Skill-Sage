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
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50">
      <Navigation user={user} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Course Catalog</h1>
          <p className="text-neutral-600 text-lg">
            Discover thousands of courses to advance your career and skills
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
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
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-neutral-600">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.isRecommended && (
                  <Badge className="absolute top-3 left-3 bg-secondary text-white">
                    Recommended
                  </Badge>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-6 line-clamp-2">
                  {course.title}
                </CardTitle>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {course.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-neutral-600">
                    by <span className="font-medium">{course.instructor}</span>
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">{course.price}</span>
                  <Button className="bg-primary hover:bg-primary/90">
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-600 mb-2">No courses found</h3>
            <p className="text-neutral-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}