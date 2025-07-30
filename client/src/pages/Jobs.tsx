
import { JobSearch } from "@/components/JobSearch";
import { useUser } from "@/lib/firebase";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, TrendingUp, MapPin, DollarSign, Users, Building, Search, Star } from "lucide-react";

export default function Jobs() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Job Opportunities
            </h1>
          </div>
          <p className="text-gray-700 text-xl max-w-2xl mx-auto">
            Discover your next career opportunity with AI-powered job recommendations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">10K+</p>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">50K+</p>
                  <p className="text-sm text-gray-600">Hired</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Search Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <JobSearch userId={user.uid} />
        </div>

        {/* Popular Job Categories */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Star className="h-6 w-6 text-yellow-500" />
              Popular Job Categories
            </CardTitle>
            <CardDescription>
              Explore trending career opportunities across different industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { category: "Software Engineering", count: "2,500+", icon: "💻", color: "from-blue-500 to-cyan-500" },
                { category: "Data Science", count: "1,200+", icon: "📊", color: "from-purple-500 to-pink-500" },
                { category: "Product Management", count: "800+", icon: "🚀", color: "from-green-500 to-emerald-500" },
                { category: "UX/UI Design", count: "600+", icon: "🎨", color: "from-orange-500 to-red-500" },
                { category: "DevOps", count: "450+", icon: "⚙️", color: "from-gray-600 to-gray-800" },
                { category: "Marketing", count: "900+", icon: "📈", color: "from-pink-500 to-rose-500" },
                { category: "Sales", count: "1,100+", icon: "💼", color: "from-indigo-500 to-blue-500" },
                { category: "Customer Success", count: "350+", icon: "🤝", color: "from-teal-500 to-cyan-500" }
              ].map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-3 text-xl`}>
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.category}</h4>
                      <p className="text-sm text-gray-600">{item.count} jobs</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Search Tips */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <TrendingUp className="h-6 w-6" />
              Job Search Success Tips
            </CardTitle>
            <CardDescription className="text-green-100">
              Expert strategies to land your dream job faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Optimize Your Profile</h4>
                    <p className="text-green-100 text-sm">Complete your profile with relevant skills, experience, and a professional photo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Use Specific Keywords</h4>
                    <p className="text-green-100 text-sm">Include relevant technical skills and job titles in your search criteria</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Set Job Alerts</h4>
                    <p className="text-green-100 text-sm">Get notified when new positions matching your criteria are posted</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Network Actively</h4>
                    <p className="text-green-100 text-sm">Connect with professionals in your industry and leverage referrals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Apply Strategically</h4>
                    <p className="text-green-100 text-sm">Quality over quantity - tailor each application to the specific role</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold">6</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Follow Up</h4>
                    <p className="text-green-100 text-sm">Send thoughtful follow-up messages after interviews and applications</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
