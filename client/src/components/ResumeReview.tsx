import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Star, TrendingUp, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  atsOptimization: string[];
  extractedData: {
    name: string;
    email: string;
    phone: string;
    experience: string[];
    education: string[];
  };
}

export function ResumeReview({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }
      
      const data = await response.json();
      if (!data.analysis) {
        throw new Error("No analysis received from server");
      }
      
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully analyzed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);
    
    setAnalysis(null); // Clear previous analysis
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Upload className="w-12 h-12 text-gray-400" />
            <input 
              type="file" 
              onChange={onFileChange} 
              className="mt-4"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || mutation.isPending} 
              className="mt-4"
            >
              {mutation.isPending ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {mutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Analyzing your resume...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {mutation.isSuccess && analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Analysis Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-green-600">{analysis.score}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{analysis.extractedData?.name || 'Name not found'}</h3>
                  <p className="text-gray-500">{analysis.extractedData?.email || 'Email not found'}</p>
                  <p className="text-gray-500">{analysis.extractedData?.phone || 'Phone not found'}</p>
                </div>
              </div>
              <p className="mt-4 text-gray-700">{analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside">
                  {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <CardTitle>Improvement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside">
                  {analysis.improvements?.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
                <CardTitle>ATS Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc list-inside">
                  {analysis.atsOptimization?.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}