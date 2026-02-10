import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircleQuestion, Lightbulb, Target, Clock, Copy } from "lucide-react";
import { ResumeInput } from "./ResumeInput";

interface ResumeData {
  personalInfo?: { name?: string; email?: string; };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; description?: string; }>;
  skills?: string[];
}

interface PredictedQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "role-specific";
  whyAsked: string;
  sampleAnswer: string;
  tips: string[];
}

interface PredictedInterviewQuestions {
  questions: PredictedQuestion[];
  focusAreas: string[];
  preparationTips: string[];
}

export function InterviewPredictor() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictedInterviewQuestions | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
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
      const response = await fetch("/api/resume/predict-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to predict questions");

      const data: PredictedInterviewQuestions = await response.json();
      setResult(data);
      toast({
        title: "Questions Generated!",
        description: `${data.questions.length} interview questions predicted`,
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Could not predict questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "behavioral": return "bg-purple-100 text-purple-800";
      case "technical": return "bg-blue-100 text-blue-800";
      case "situational": return "bg-green-100 text-green-800";
      case "role-specific": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const copyQuestion = (question: PredictedQuestion) => {
    const text = `Question: ${question.question}\n\nWhy Asked: ${question.whyAsked}\n\nSample Answer: ${question.sampleAnswer}\n\nTips:\n${question.tips.map(t => `• ${t}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Question and answer copied to clipboard" });
  };

  const copyAllQuestions = () => {
    if (!result) return;
    const text = result.questions
      .map((q, i) => `${i + 1}. ${q.question}\nCategory: ${q.category}\nSample Answer: ${q.sampleAnswer}\n`)
      .join("\n---\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "All questions copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Resume Input Section */}
      <ResumeInput
        onResumeReady={setResumeData}
        title="Your Resume"
        description="Add your resume to predict likely interview questions"
      />

      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="icon-wrapper icon-wrapper-sm bg-indigo-100">
              <MessageCircleQuestion className="icon-sm text-indigo-600" />
            </div>
            Interview Question Predictor
          </CardTitle>
          <CardDescription>
            Based on your resume, predict likely interview questions with sample answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jdOptional">Job Description (Optional)</Label>
            <Textarea
              id="jdOptional"
              placeholder="Paste a job description for more targeted questions (optional)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Adding a job description will generate more role-specific questions
            </p>
          </div>

          <Button onClick={handlePredict} disabled={isLoading || !resumeData} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 icon-sm spinner" />
                Predicting Questions...
              </>
            ) : (
              <>
                <Target className="mr-2 icon-sm" />
                Predict Interview Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Focus Areas</CardTitle>
              <CardDescription>
                Interviewers will likely focus on these aspects of your background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.focusAreas.map((area, i) => (
                  <Badge key={i} variant="secondary">{area}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predicted Questions */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircleQuestion className="icon-sm" />
                  Predicted Questions ({result.questions.length})
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyAllQuestions}
                  className="group"
                  data-tooltip="Copy all questions"
                >
                  <Copy className="icon-sm mr-1 transition-transform duration-150 group-hover:scale-110" /> Copy All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {result.questions.map((q, i) => (
                  <AccordionItem key={i} value={`question-${i}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-3 pr-4">
                        <span className="text-muted-foreground font-mono text-sm mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="space-y-1">
                          <span className="font-medium">{q.question}</span>
                          <div>
                            <Badge className={getCategoryColor(q.category)} variant="outline">
                              {q.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-8">
                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-1">
                            Why This is Asked:
                          </h5>
                          <p className="text-sm">{q.whyAsked}</p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Lightbulb className="icon-sm text-yellow-500" />
                            Sample Answer:
                          </h5>
                          <p className="text-sm italic">{q.sampleAnswer}</p>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm text-muted-foreground mb-2">
                            Tips for Answering:
                          </h5>
                          <ul className="space-y-1">
                            {q.tips.map((tip, j) => (
                              <li key={j} className="text-sm flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyQuestion(q)}
                          className="mt-2 group"
                          data-tooltip="Copy question and answer"
                        >
                          <Copy className="icon-xs mr-1 transition-transform duration-150 group-hover:scale-110" /> Copy Q&A
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Preparation Tips */}
          <Card className="card-professional border-indigo-200 bg-indigo-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <div className="icon-wrapper icon-wrapper-sm bg-indigo-100">
                  <Clock className="icon-sm text-indigo-600" />
                </div>
                Preparation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.preparationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
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
