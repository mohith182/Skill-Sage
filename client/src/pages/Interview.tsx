import { useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Users, TrendingUp, Mic, Play, RotateCcw, Trophy, Clock, Target } from "lucide-react";

interface InterviewProps {
  user: FirebaseUser;
}

interface InterviewSession {
  id: string;
  type: string;
  question: string;
  userResponse: string;
  feedback: string;
  score: number;
  createdAt: string;
}

const interviewTypes = [
  {
    type: "technical",
    icon: Code,
    title: "Technical Interview",
    description: "Coding challenges, algorithms, and system design questions",
    color: "from-blue-500 to-blue-600",
    examples: ["Data structures", "Algorithms", "System design", "Code optimization"]
  },
  {
    type: "behavioral",
    icon: Users,
    title: "Behavioral Interview", 
    description: "Leadership scenarios, teamwork, and problem-solving situations",
    color: "from-green-500 to-green-600",
    examples: ["Tell me about a time...", "Leadership challenges", "Conflict resolution", "Goal achievement"]
  },
  {
    type: "case_study",
    icon: TrendingUp,
    title: "Case Study Interview",
    description: "Business scenarios, strategic thinking, and analytical problems",
    color: "from-purple-500 to-purple-600", 
    examples: ["Market analysis", "Business strategy", "Problem diagnosis", "Solution design"]
  },
];

export default function Interview({ user }: InterviewProps) {
  const userId = user.uid;
  const [selectedType, setSelectedType] = useState<string>("technical");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any>(null);

  // Get interview history
  const { data: sessions = [] } = useQuery<InterviewSession[]>({
    queryKey: ["/api/interview/sessions", userId],
  });

  // Generate question mutation
  const generateQuestionMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", "/api/interview/question", { type });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentQuestion(data.question);
      setSessionActive(true);
      setUserResponse("");
      setFeedback(null);
    },
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async ({ question, response, type }: { question: string; response: string; type: string }) => {
      const apiResponse = await apiRequest("POST", "/api/interview/response", { 
        userId,
        question, 
        response, 
        type 
      });
      return apiResponse.json();
    },
    onSuccess: (data) => {
      setFeedback(data);
      setSessionActive(false);
    },
  });

  const startInterview = () => {
    generateQuestionMutation.mutate(selectedType);
  };

  const submitResponse = () => {
    if (!userResponse.trim()) return;
    
    submitResponseMutation.mutate({
      question: currentQuestion,
      response: userResponse,
      type: selectedType
    });
  };

  const resetInterview = () => {
    setSessionActive(false);
    setCurrentQuestion("");
    setUserResponse("");
    setFeedback(null);
  };

  const selectedTypeInfo = interviewTypes.find(t => t.type === selectedType);

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <div className="section-container py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Mock Interview Simulator</h1>
          <p className="text-muted-foreground text-sm">
            Practice with AI-powered interview scenarios and get instant feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Interview Type Selection */}
            {!sessionActive && !feedback && (
              <Card className="card-professional">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="icon-wrapper icon-wrapper-sm icon-bg-primary">
                      <Target className="icon-sm icon-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">Choose Interview Type</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {interviewTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.type}
                          onClick={() => setSelectedType(type.type)}
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                            selectedType === type.type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="icon-wrapper icon-wrapper-sm icon-bg-primary mb-3">
                            <Icon className="icon-sm icon-primary" />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">{type.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {type.examples.slice(0, 2).map((example, index) => (
                              <Badge key={index} variant="outline" className="text-xs h-5">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={startInterview}
                      disabled={generateQuestionMutation.isPending}
                      className="h-10"
                    >
                      {generateQuestionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Question...
                        </>
                      ) : (
                        <>
                          <Play className="icon-sm mr-2" />
                          Start {selectedTypeInfo?.title}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Interview */}
            {sessionActive && (
              <Card className="card-professional">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mic className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold">{selectedTypeInfo?.title} in Progress</CardTitle>
                    </div>
                    <span className="status-badge status-info text-xs">
                      {selectedType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <h3 className="font-medium text-sm text-foreground mb-2">Interview Question:</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentQuestion}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Response:
                    </label>
                    <Textarea
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Type your detailed response here..."
                      className="min-h-[160px] text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={submitResponse}
                      disabled={!userResponse.trim() || submitResponseMutation.isPending}
                      className="h-9"
                    >
                      {submitResponseMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        "Submit Response"
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetInterview} className="h-9">
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Display */}
            {feedback && (
              <Card className="card-professional">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">Interview Feedback</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-3">
                      {feedback.score}
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Score: {feedback.score}/100
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <h3 className="font-medium text-sm text-foreground mb-2">Detailed Feedback:</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feedback.feedback}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                      <h3 className="font-medium text-sm text-emerald-700 mb-2">Strengths:</h3>
                      <ul className="space-y-1.5">
                        {feedback.strengths?.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-xs text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                      <h3 className="font-medium text-sm text-amber-700 mb-2">Areas for Improvement:</h3>
                      <ul className="space-y-1.5">
                        {feedback.improvements?.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-xs text-muted-foreground">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={startInterview} className="h-9">
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Try Another Question
                    </Button>
                    <Button variant="outline" onClick={resetInterview} className="h-9">
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Choose Different Type
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Interview History */}
          <div className="space-y-5">
            <Card className="card-professional">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="p-3 border border-border rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs h-5">
                            {session.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            {session.score}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {session.question}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Mic className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No interview sessions yet</p>
                    <p className="text-xs text-muted-foreground/70">Start your first mock interview!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="card-professional">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Take your time to think before answering</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Use the STAR method for behavioral questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Explain your thought process clearly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>Practice regularly to improve your skills</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}