import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle2, AlertCircle, User, Briefcase, GraduationCap, Loader2 } from "lucide-react";

interface ResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
  }>;
  skills?: string[];
}

interface ResumeInputProps {
  onResumeReady: (resumeData: ResumeData) => void;
  title?: string;
  description?: string;
}

export function ResumeInput({ 
  onResumeReady, 
  title = "Your Resume",
  description = "Provide your resume to continue"
}: ResumeInputProps) {
  const [hasStoredResume, setHasStoredResume] = useState(false);
  const [storedResumeData, setStoredResumeData] = useState<ResumeData | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState("stored");
  const [isResumeConfirmed, setIsResumeConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkStoredResume();
  }, []);

  const checkStoredResume = () => {
    const stored = localStorage.getItem("resumeData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setStoredResumeData(data);
        setHasStoredResume(true);
        setActiveTab("stored");
      } catch {
        setHasStoredResume(false);
        setActiveTab("upload");
      }
    } else {
      setHasStoredResume(false);
      setActiveTab("upload");
    }
  };

  const handleUseStoredResume = () => {
    if (storedResumeData) {
      setIsResumeConfirmed(true);
      onResumeReady(storedResumeData);
      toast({
        title: "Resume Loaded",
        description: "Using your saved resume",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      
      // Parse the resume
      setIsParsing(true);
      const parseResponse = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: data.fileId || data.id, content: data.content }),
      });

      if (parseResponse.ok) {
        const parsedData = await parseResponse.json();
        localStorage.setItem("resumeData", JSON.stringify(parsedData));
        setStoredResumeData(parsedData);
        setHasStoredResume(true);
        setIsResumeConfirmed(true);
        onResumeReady(parsedData);
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been processed successfully",
        });
      } else {
        // If parsing fails, create basic resume data from file info
        const basicData: ResumeData = {
          personalInfo: { name: file.name.replace(/\.[^/.]+$/, "") },
          skills: [],
        };
        localStorage.setItem("resumeData", JSON.stringify(basicData));
        setStoredResumeData(basicData);
        setHasStoredResume(true);
        setIsResumeConfirmed(true);
        onResumeReady(basicData);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload resume. Please try again or paste text.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleTextSubmit = () => {
    if (!resumeText.trim()) {
      toast({
        title: "No Content",
        description: "Please paste your resume content",
        variant: "destructive",
      });
      return;
    }

    // Parse text into basic resume structure
    const lines = resumeText.split("\n").filter(l => l.trim());
    const resumeData: ResumeData = {
      personalInfo: {
        name: lines[0] || "Your Name",
      },
      summary: resumeText,
      skills: extractSkills(resumeText),
    };

    localStorage.setItem("resumeData", JSON.stringify(resumeData));
    setStoredResumeData(resumeData);
    setHasStoredResume(true);
    setIsResumeConfirmed(true);
    onResumeReady(resumeData);
    toast({
      title: "Resume Saved",
      description: "Your resume text has been processed",
    });
  };

  const extractSkills = (text: string): string[] => {
    const commonSkills = [
      "JavaScript", "TypeScript", "Python", "Java", "React", "Node.js", "SQL",
      "AWS", "Docker", "Kubernetes", "Git", "Agile", "Scrum", "Machine Learning",
      "Data Analysis", "Project Management", "Communication", "Leadership",
      "HTML", "CSS", "Vue", "Angular", "MongoDB", "PostgreSQL", "Redis",
      "GraphQL", "REST API", "CI/CD", "Linux", "Azure", "GCP"
    ];
    
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  };

  const handleChangeResume = () => {
    setIsResumeConfirmed(false);
  };

  if (isResumeConfirmed && storedResumeData) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Resume Ready</h4>
                <p className="text-sm text-green-600">
                  {storedResumeData.personalInfo?.name || "Your resume"} • 
                  {storedResumeData.skills?.length || 0} skills detected
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangeResume}>
              Change Resume
            </Button>
          </div>
          
          {/* Quick preview */}
          <div className="mt-4 flex flex-wrap gap-2">
            {storedResumeData.skills?.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="secondary">{skill}</Badge>
            ))}
            {(storedResumeData.skills?.length || 0) > 5 && (
              <Badge variant="outline">+{(storedResumeData.skills?.length || 0) - 5} more</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stored" disabled={!hasStoredResume}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Saved Resume
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="paste">
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stored" className="space-y-4">
            {hasStoredResume && storedResumeData ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{storedResumeData.personalInfo?.name || "Your Name"}</h4>
                      {storedResumeData.personalInfo?.email && (
                        <p className="text-sm text-muted-foreground">{storedResumeData.personalInfo.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {storedResumeData.experience && storedResumeData.experience.length > 0 && (
                    <div className="flex items-start gap-3 mt-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm">
                          {storedResumeData.experience[0].title} at {storedResumeData.experience[0].company}
                        </p>
                        {storedResumeData.experience.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            +{storedResumeData.experience.length - 1} more positions
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {storedResumeData.skills && storedResumeData.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {storedResumeData.skills.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        {storedResumeData.skills.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{storedResumeData.skills.length - 6}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={handleUseStoredResume} className="w-full">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Use This Resume
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No saved resume found</p>
                <p className="text-sm">Upload a file or paste your resume text</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
                aria-label="Upload resume file"
                title="Upload resume file"
              />
              {isUploading || isParsing ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {isParsing ? "Parsing resume..." : "Uploading..."}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Click to upload resume</p>
                  <p className="text-sm text-muted-foreground">PDF, DOC, DOCX, or TXT (max 5MB)</p>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumeText">Paste Your Resume</Label>
              <Textarea
                id="resumeText"
                placeholder="Paste your entire resume content here...

Example:
John Doe
Software Engineer
john@email.com

SUMMARY
Experienced software engineer with 5+ years...

EXPERIENCE
Senior Developer at Tech Corp
- Led team of 5 developers
- Implemented CI/CD pipeline

SKILLS
JavaScript, React, Node.js, Python..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleTextSubmit} className="w-full" disabled={!resumeText.trim()}>
              <FileText className="w-4 h-4 mr-2" />
              Use This Resume
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
