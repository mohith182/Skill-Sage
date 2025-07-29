
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResumeReviewProps {
  userId: string;
}

interface ResumeAnalysis {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export function ResumeReview({ userId }: ResumeReviewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setAnalysis(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a resume file first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', userId);

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        toast({
          title: "Resume analyzed successfully!",
          description: "Check the detailed feedback below",
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Resume Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-neutral-600">Upload your resume for AI-powered analysis</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>
          )}
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Overall Score:</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </span>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700">• {strength}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {analysis.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-orange-700">• {improvement}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-700">• {recommendation}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
