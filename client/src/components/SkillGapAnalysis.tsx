import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, BookOpen, ExternalLink, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { ResumeInput } from "./ResumeInput";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; description?: string; }>;
  skills?: string[];
}

interface LearningResource {
  name: string;
  type: "course" | "certification" | "tutorial" | "documentation";
  platform: string;
  url: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
}

interface SkillCategory {
  name: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface SkillGapResponse {
  overallMatchScore: number;
  categories: SkillCategory[];
  criticalGaps: string[];
  learningPath: LearningResource[];
  timeToJobReady: string;
  recommendations: string[];
}

export function SkillGapAnalysis() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SkillGapResponse | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing Job Description",
        description: "Please paste a job description to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!resumeData) {
      toast({
        title: "No Resume",
        description: "Please add your resume first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const skills = resumeData.skills || [];

      const response = await fetch("/api/resume/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, jobDescription }),
      });

      if (!response.ok) throw new Error("Failed to analyze skill gap");

      const data: SkillGapResponse = await response.json();
      setResult(data);
      toast({
        title: "Analysis Complete!",
        description: `Match Score: ${data.overallMatchScore}%`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze skill gap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Resume Input Section */}
      <ResumeInput
        onResumeReady={setResumeData}
        title="Your Resume"
        description="Add your resume to analyze skill gaps against job requirements"
      />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-wrapper icon-wrapper-sm bg-blue-100">
              <Target className="icon-sm text-blue-600" />
            </div>
            Skill Gap Analysis
          </CardTitle>
          <CardDescription>
            Compare your skills against job requirements and get a personalized learning path
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jdInput">Job Description</Label>
            <Textarea
              id="jdInput"
              placeholder="Paste the job description to analyze your skill match..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleAnalyze} disabled={isLoading || !resumeData} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 icon-sm spinner" />
                Analyzing Skills...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 icon-sm" />
                Analyze Skill Gap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Match Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(result.overallMatchScore)}`}>
                  {result.overallMatchScore}%
                </span>
              </CardTitle>
              <CardDescription>
                Estimated time to job-ready: <strong>{result.timeToJobReady}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={result.overallMatchScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Skill Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Categories Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.categories.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{cat.name}</h4>
                    <span className={getScoreColor(cat.matchPercentage)}>
                      {cat.matchPercentage}%
                    </span>
                  </div>
                  <Progress value={cat.matchPercentage} className="h-2" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cat.matchedSkills.map((skill, j) => (
                      <Badge key={j} variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                    {cat.missingSkills.map((skill, j) => (
                      <Badge key={j} variant="outline" className="border-orange-300 text-orange-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Critical Gaps */}
          {result.criticalGaps.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Critical Skill Gaps
                </CardTitle>
                <CardDescription>
                  These skills are essential for this role and should be prioritized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.criticalGaps.map((gap, i) => (
                    <Badge key={i} variant="destructive">{gap}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Path */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Recommended Learning Path
              </CardTitle>
              <CardDescription>
                Curated resources to help you bridge the skill gap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.learningPath.map((resource, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${getPriorityColor(resource.priority)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {resource.platform} • {resource.type} • {resource.estimatedTime}
                        </p>
                      </div>
                      <Badge variant="outline">{resource.priority} priority</Badge>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      Open Resource <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Action Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
