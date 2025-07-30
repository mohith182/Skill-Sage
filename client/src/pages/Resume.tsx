
import { ResumeReview } from "@/components/ResumeReview";
import { useUser } from "@/lib/firebase";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, TrendingUp, CheckCircle, Target, Award } from "lucide-react";

export default function Resume() {
  const user = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your resume workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Analysis
            </h1>
          </div>
          <p className="text-gray-700 text-xl max-w-2xl mx-auto">
            Get intelligent feedback, scoring, and actionable recommendations to make your resume stand out
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Smart Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get a comprehensive score based on content, format, keywords, and industry standards.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Improvement Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Receive specific, actionable recommendations to enhance your resume's impact.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">ATS Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Ensure your resume passes through Applicant Tracking Systems effectively.</p>
            </CardContent>
          </Card>
        </div>

        {/* Resume Review Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <ResumeReview userId={user.uid} />
        </div>

        {/* Additional Tips Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Award className="h-6 w-6" />
              Pro Resume Tips
            </CardTitle>
            <CardDescription className="text-blue-100">
              Expert advice to make your resume shine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Quantify Your Achievements</h4>
                    <p className="text-blue-100 text-sm">Use numbers, percentages, and metrics to demonstrate your impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Tailor for Each Job</h4>
                    <p className="text-blue-100 text-sm">Customize your resume keywords and content for specific positions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Use Action Verbs</h4>
                    <p className="text-blue-100 text-sm">Start bullet points with strong action words like "Led," "Developed," "Achieved"</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Keep It Concise</h4>
                    <p className="text-blue-100 text-sm">Aim for 1-2 pages max, focus on relevant experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Professional Formatting</h4>
                    <p className="text-blue-100 text-sm">Use consistent fonts, spacing, and a clean, readable layout</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Include Keywords</h4>
                    <p className="text-blue-100 text-sm">Use industry-specific terms and skills mentioned in job descriptions</p>
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
