import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Languages, Copy, Download, Globe } from "lucide-react";
import { ResumeInput } from "./ResumeInput";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; description?: string; }>;
  skills?: string[];
}

interface TranslatedContent {
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    description: string;
  }>;
  skills?: string[];
  education?: Array<{
    degree: string;
    school: string;
  }>;
}

interface TranslatedResume {
  translatedContent: TranslatedContent;
  targetLanguage: string;
  culturalAdaptations: string[];
  formattingNotes: string[];
}

const LANGUAGES = [
  { code: "spanish", name: "Spanish", flag: "🇪🇸" },
  { code: "french", name: "French", flag: "🇫🇷" },
  { code: "german", name: "German", flag: "🇩🇪" },
  { code: "mandarin", name: "Mandarin Chinese", flag: "🇨🇳" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵" },
  { code: "korean", name: "Korean", flag: "🇰🇷" },
  { code: "portuguese", name: "Portuguese", flag: "🇧🇷" },
  { code: "italian", name: "Italian", flag: "🇮🇹" },
  { code: "dutch", name: "Dutch", flag: "🇳🇱" },
  { code: "russian", name: "Russian", flag: "🇷🇺" },
  { code: "arabic", name: "Arabic", flag: "🇸🇦" },
  { code: "hindi", name: "Hindi", flag: "🇮🇳" },
  { code: "polish", name: "Polish", flag: "🇵🇱" },
  { code: "swedish", name: "Swedish", flag: "🇸🇪" },
];

export function ResumeTranslator() {
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslatedResume | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast({
        title: "Select Language",
        description: "Please select a target language for translation",
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
      const response = await fetch("/api/resume/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, targetLanguage }),
      });

      if (!response.ok) throw new Error("Failed to translate resume");

      const data: TranslatedResume = await response.json();
      setResult(data);
      toast({
        title: "Translation Complete!",
        description: `Resume translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Could not translate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTranslatedContent = () => {
    if (!result) return "";
    const { translatedContent } = result;
    let text = "";

    if (translatedContent.summary) {
      text += `SUMMARY\n${translatedContent.summary}\n\n`;
    }

    if (translatedContent.experience?.length) {
      text += "EXPERIENCE\n";
      translatedContent.experience.forEach(exp => {
        text += `${exp.title} - ${exp.company}\n${exp.description}\n\n`;
      });
    }

    if (translatedContent.skills?.length) {
      text += `SKILLS\n${translatedContent.skills.join(", ")}\n\n`;
    }

    if (translatedContent.education?.length) {
      text += "EDUCATION\n";
      translatedContent.education.forEach(edu => {
        text += `${edu.degree} - ${edu.school}\n`;
      });
    }

    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formatTranslatedContent());
    toast({ title: "Copied!", description: "Translated resume copied to clipboard" });
  };

  const downloadAsText = () => {
    const blob = new Blob([formatTranslatedContent()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Resume Input Section */}
      <ResumeInput
        onResumeReady={setResumeData}
        title="Your Resume"
        description="Add your resume to translate it into different languages"
      />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-wrapper icon-wrapper-sm bg-green-100">
              <Globe className="icon-sm text-green-600" />
            </div>
            Multi-Language Resume Translator
          </CardTitle>
          <CardDescription>
            Translate your resume into different languages with cultural adaptations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a language..." />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleTranslate} disabled={isLoading || !resumeData} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 icon-sm spinner" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="mr-2 icon-sm" />
                Translate Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {LANGUAGES.find(l => l.code === targetLanguage)?.flag}
                  Translated Resume
                </span>
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
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                {formatTranslatedContent()}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-base">Cultural Adaptations</CardTitle>
                <CardDescription>
                  Adjustments made for the target region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.culturalAdaptations.map((adaptation, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {adaptation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-base">Formatting Notes</CardTitle>
                <CardDescription>
                  Region-specific resume practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.formattingNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
