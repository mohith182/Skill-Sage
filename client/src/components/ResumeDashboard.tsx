import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Edit, 
  Search, 
  Plus, 
  Download,
  Upload,
  BarChart3,
  Palette,
  Settings,
  Folder,
  Clock,
  CheckCircle
} from "lucide-react";
import { ResumeBuilder } from "./ResumeBuilder";
import { ResumeAnalyzer } from "./ResumeAnalyzer";
import { ResumeEditor } from "./ResumeEditor";

interface ResumeDashboardProps {
  userId: string;
}

export function ResumeDashboard({ userId }: ResumeDashboardProps) {
  const [activeTab, setActiveTab] = useState("builder");
  const [savedResume, setSavedResume] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resume Center</h1>
          <p className="text-gray-600 mt-2">
            Build, analyze, and edit your professional resume
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resume Builder</p>
                <p className="text-lg font-bold">Create New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resume Analyzer</p>
                <p className="text-lg font-bold">AI Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resume Editor</p>
                <p className="text-lg font-bold">Edit & Format</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Resume</p>
                <p className="text-lg font-bold">
                  {savedResume ? "Available" : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Resume Status */}
      {savedResume && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Resume Saved</h3>
                  <p className="text-sm text-green-600">
                    Last saved: {lastSaved?.toLocaleString() || "Recently"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => setActiveTab("editor")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="builder" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Builder</span>
                  </TabsTrigger>
                  <TabsTrigger value="analyzer" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analyzer</span>
                  </TabsTrigger>
                  <TabsTrigger value="editor" className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Editor</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="builder" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Resume Builder</h2>
                  <p className="text-gray-600">
                    Create a professional resume from scratch with our easy-to-use builder
                  </p>
                </div>
                <ResumeBuilder userId={userId} />
              </TabsContent>

              <TabsContent value="analyzer" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Resume Analyzer</h2>
                  <p className="text-gray-600">
                    Upload your resume for AI-powered analysis and optimization suggestions
                  </p>
                </div>
                <ResumeAnalyzer userId={userId} />
              </TabsContent>

              <TabsContent value="editor" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Resume Editor</h2>
                  <p className="text-gray-600">
                    Edit and format your resume with multiple templates and export options
                  </p>
                </div>
                <ResumeEditor userId={userId} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Best Practices</h4>
              <ul className="space-y-2 text-sm">
                <li>• Keep your resume to 1-2 pages maximum</li>
                <li>• Use action verbs to describe your achievements</li>
                <li>• Quantify your accomplishments with numbers</li>
                <li>• Tailor your resume to each job application</li>
                <li>• Use a clean, professional font and layout</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">ATS Optimization</h4>
              <ul className="space-y-2 text-sm">
                <li>• Include relevant keywords from job descriptions</li>
                <li>• Use standard section headings (Experience, Education, Skills)</li>
                <li>• Avoid graphics, tables, or complex formatting</li>
                <li>• Save as PDF to preserve formatting</li>
                <li>• Use bullet points for easy scanning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 