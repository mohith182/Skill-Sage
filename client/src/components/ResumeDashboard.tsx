import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Edit, 
  Search, 
  Plus, 
  Download,
  BarChart3,
  Palette,
  CheckCircle,
  Sparkles,
  Target,
  Globe,
  Flame,
  MessageCircleQuestion,
  Lightbulb
} from "lucide-react";
import { ResumeBuilder } from "./ResumeBuilder";
import { ResumeAnalyzer } from "./ResumeAnalyzer";
import { ResumeEditor } from "./ResumeEditor";
import { CoverLetterGenerator } from "./CoverLetterGenerator";
import { SkillGapAnalysis } from "./SkillGapAnalysis";
import { ResumeTranslator } from "./ResumeTranslator";
import { ResumeRoast } from "./ResumeRoast";
import { InterviewPredictor } from "./InterviewPredictor";

interface ResumeDashboardProps {
  userId: string;
}

export function ResumeDashboard({ userId }: ResumeDashboardProps) {
  const [activeTab, setActiveTab] = useState("builder");
  const [savedResume, setSavedResume] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const quickStats = [
    { icon: FileText, label: "Resume Builder", value: "Create New", color: "text-primary" },
    { icon: Search, label: "Resume Analyzer", value: "AI Analysis", color: "text-emerald-600" },
    { icon: Edit, label: "Resume Editor", value: "Edit & Format", color: "text-violet-600" },
    { icon: Sparkles, label: "AI Features", value: "5 Tools", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Build, analyze, and optimize your professional resume
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="card-professional">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Saved Resume Status */}
      {savedResume && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-emerald-800 dark:text-emerald-200">Resume Saved</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Last saved: {lastSaved?.toLocaleString() || "Recently"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8" onClick={() => setActiveTab("editor")}>
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="h-8">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card className="card-professional">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border">
              <div className="px-4 py-3">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex w-max gap-1 h-9 bg-muted/50 p-1">
                    <TabsTrigger value="builder" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Builder</span>
                    </TabsTrigger>
                    <TabsTrigger value="analyzer" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Analyzer</span>
                    </TabsTrigger>
                    <TabsTrigger value="editor" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Editor</span>
                    </TabsTrigger>
                    <TabsTrigger value="cover-letter" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cover Letter</span>
                    </TabsTrigger>
                    <TabsTrigger value="skill-gap" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Target className="w-3.5 h-3.5" />
                      <span>Skill Gap</span>
                    </TabsTrigger>
                    <TabsTrigger value="translate" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Translate</span>
                    </TabsTrigger>
                    <TabsTrigger value="roast" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Roast</span>
                    </TabsTrigger>
                    <TabsTrigger value="interview" className="flex items-center gap-1.5 text-xs px-3 data-[state=active]:bg-background">
                      <MessageCircleQuestion className="w-3.5 h-3.5" />
                      <span>Interview Prep</span>
                    </TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>

            <div className="p-5">
              <TabsContent value="builder" className="space-y-5 mt-0">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Resume Builder</h2>
                  <p className="text-sm text-muted-foreground">
                    Create a professional resume from scratch with our builder
                  </p>
                </div>
                <ResumeBuilder userId={userId} />
              </TabsContent>

              <TabsContent value="analyzer" className="space-y-5 mt-0">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Resume Analyzer</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload your resume for AI-powered analysis and optimization
                  </p>
                </div>
                <ResumeAnalyzer userId={userId} />
              </TabsContent>

              <TabsContent value="editor" className="space-y-5 mt-0">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-foreground mb-1">Resume Editor</h2>
                  <p className="text-sm text-muted-foreground">
                    Edit and format your resume with multiple templates
                  </p>
                </div>
                <ResumeEditor userId={userId} />
              </TabsContent>

              <TabsContent value="cover-letter" className="space-y-5 mt-0">
                <CoverLetterGenerator />
              </TabsContent>

              <TabsContent value="skill-gap" className="space-y-5 mt-0">
                <SkillGapAnalysis />
              </TabsContent>

              <TabsContent value="translate" className="space-y-5 mt-0">
                <ResumeTranslator />
              </TabsContent>

              <TabsContent value="roast" className="space-y-5 mt-0">
                <ResumeRoast />
              </TabsContent>

              <TabsContent value="interview" className="space-y-5 mt-0">
                <InterviewPredictor />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Resume Tips</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm mb-3 text-emerald-600">Best Practices</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Keep your resume to 1-2 pages maximum
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Use action verbs to describe achievements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Quantify accomplishments with numbers
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Tailor your resume to each application
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3 text-primary">ATS Optimization</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  Include keywords from job descriptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  Use standard section headings
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  Avoid graphics or complex formatting
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  Save as PDF to preserve formatting
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 