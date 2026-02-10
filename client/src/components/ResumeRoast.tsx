import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flame, AlertTriangle, CheckCircle, XCircle, Lightbulb, Zap, ThermometerSun } from "lucide-react";
import { ResumeInput } from "./ResumeInput";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; description?: string; }>;
  skills?: string[];
}

interface ScoreCard {
  readability: number;
  impact: number;
  keywords: number;
  formatting: number;
  atsCompatibility: number;
}

interface ResumeRoast {
  overallScore: number;
  roastLevel: "mild" | "medium" | "spicy";
  scoreCard: ScoreCard;
  brutallHonestFeedback: string[];
  whatWorks: string[];
  criticalFixes: string[];
  quickWins: string[];
  finalVerdict: string;
}

export function ResumeRoast() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeRoast | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const handleRoast = async () => {
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
      const resumeContent = JSON.stringify(resumeData);

      const response = await fetch("/api/resume/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeContent, resumeData }),
      });

      if (!response.ok) throw new Error("Failed to roast resume");

      const data: ResumeRoast = await response.json();
      setResult(data);
      toast({
        title: "Roast Complete",
        description: `Overall Score: ${data.overallScore}/100`,
      });
    } catch (error) {
      toast({
        title: "Roast Failed",
        description: "Could not roast resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-amber-600";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-700";
  };

  const getRoastLevelIndicator = (level: string) => {
    switch (level) {
      case "mild": return { count: 1, color: "bg-yellow-400" };
      case "medium": return { count: 2, color: "bg-orange-400" };
      case "spicy": return { count: 3, color: "bg-red-500" };
      default: return { count: 1, color: "bg-orange-400" };
    }
  };

  const scoreLabels: Record<keyof ScoreCard, string> = {
    readability: "Readability",
    impact: "Impact & Strength",
    keywords: "Keyword Optimization",
    formatting: "Formatting & Layout",
    atsCompatibility: "ATS Compatibility",
  };

  return (
    <div className="space-y-6">
      {/* Resume Input Section */}
      <ResumeInput
        onResumeReady={setResumeData}
        title="Your Resume"
        description="Add your resume to get brutally honest feedback"
      />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-wrapper icon-wrapper-sm icon-bg-warning">
              <Flame className="icon-sm" />
            </div>
            Resume Roast
          </CardTitle>
          <CardDescription>
            Get brutally honest feedback on your resume with actionable improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRoast}
            disabled={isLoading || !resumeData}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 icon-sm spinner" />
                Roasting Your Resume...
              </>
            ) : (
              <>
                <Flame className="mr-2 icon-sm" />
                Roast My Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Overall Score */}
          <Card className={`bg-gradient-to-r ${getScoreGradient(result.overallScore)} text-white`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold">{result.overallScore}</div>
                <div className="text-xl mt-2">out of 100</div>
                <Badge variant="secondary" className="mt-4 text-lg px-4 py-1 flex items-center gap-2">
                  <div className={`roast-level roast-${result.roastLevel}`}>
                    {Array.from({ length: getRoastLevelIndicator(result.roastLevel).count }).map((_, i) => (
                      <span key={i} className={`roast-indicator ${getRoastLevelIndicator(result.roastLevel).color}`} />
                    ))}
                  </div>
                  {result.roastLevel.toUpperCase()} ROAST
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ThermometerSun className="icon-sm text-primary" />
                Detailed Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(result.scoreCard).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{scoreLabels[key as keyof ScoreCard]}</span>
                    <span className={getScoreColor(value)}>{value}/100</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Brutally Honest Feedback */}
          <Card className="card-professional border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
                <div className="icon-wrapper icon-wrapper-sm bg-orange-100">
                  <AlertTriangle className="icon-sm text-orange-600" />
                </div>
                Brutally Honest Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.brutallHonestFeedback.map((feedback, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Flame className="icon-sm text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{feedback}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* What Works */}
            <Card className="card-professional border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 text-base">
                  <div className="icon-wrapper icon-wrapper-sm bg-green-100">
                    <CheckCircle className="icon-sm text-green-600" />
                  </div>
                  What's Working
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.whatWorks.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="icon-sm text-green-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Critical Fixes */}
            <Card className="card-professional border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 text-base">
                  <div className="icon-wrapper icon-wrapper-sm bg-red-100">
                    <XCircle className="icon-sm text-red-600" />
                  </div>
                  Critical Fixes Needed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.criticalFixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="icon-sm text-red-600 mt-0.5 shrink-0" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Quick Wins */}
          <Card className="card-professional border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
                <div className="icon-wrapper icon-wrapper-sm bg-blue-100">
                  <Zap className="icon-sm text-blue-600" />
                </div>
                Quick Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {result.quickWins.map((win, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-white rounded-lg border border-blue-200 transition-all duration-150 hover:border-blue-300 hover:shadow-sm"
                  >
                    <Lightbulb className="icon-sm text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{win}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final Verdict */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="text-base">Final Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg italic text-muted-foreground">"{result.finalVerdict}"</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
