import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Download, FileText, Sparkles } from "lucide-react";
import { ResumeInput } from "./ResumeInput";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; description?: string; }>;
  skills?: string[];
}

interface CoverLetterResponse {
  coverLetter: string;
  keyHighlights: string[];
  customizedElements: string[];
  suggestedSubjectLine: string;
}

export function CoverLetterGenerator() {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterResponse | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const getToneLabel = (value: number) => {
    if (value <= 33) return "Formal";
    if (value <= 66) return "Balanced";
    return "Creative";
  };

  const getToneValue = (value: number) => {
    if (value <= 33) return "formal";
    if (value <= 66) return "enthusiastic";
    return "creative";
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim() || !companyName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both job description and company name",
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
      const response = await fetch("/api/resume/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription,
          companyName,
          tone: getToneValue(tone),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate cover letter");

      const data: CoverLetterResponse = await response.json();
      setResult(data);
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter is ready",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.coverLetter);
      toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
    }
  };

  const downloadAsText = () => {
    if (result) {
      const blob = new Blob([result.coverLetter], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${companyName.replace(/\s+/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Input Section */}
      <ResumeInput
        onResumeReady={setResumeData}
        title="Your Resume"
        description="Add your resume to generate a personalized cover letter"
      />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-wrapper icon-wrapper-sm bg-purple-100">
              <Sparkles className="icon-sm text-purple-600" />
            </div>
            AI Cover Letter Generator
          </CardTitle>
          <CardDescription>
            Generate a personalized cover letter tailored to the job and company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Google, Microsoft, Amazon"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Writing Tone: {getToneLabel(tone)}</Label>
              <Slider
                value={[tone]}
                onValueChange={(v) => setTone(v[0])}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Formal</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || !resumeData} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 icon-sm spinner" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 icon-sm" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Cover Letter</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="group"
                  data-tooltip="Copy to clipboard"
                >
                  <Copy className="icon-sm mr-1 transition-transform duration-150 group-hover:scale-110" /> Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadAsText}
                  className="group"
                  data-tooltip="Download as text file"
                >
                  <Download className="icon-sm mr-1 transition-transform duration-150 group-hover:scale-110" /> Download
                </Button>
              </div>
            </CardTitle>
            {result.suggestedSubjectLine && (
              <CardDescription>
                <strong>Suggested Subject:</strong> {result.suggestedSubjectLine}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {result.coverLetter}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Key Highlights Used</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.keyHighlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">Customized Elements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.customizedElements.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
