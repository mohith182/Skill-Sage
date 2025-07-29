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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50">
      <Navigation user={user} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Mock Interview Simulator</h1>
          <p className="text-neutral-600 text-lg">
            Practice with AI-powered interview scenarios and get instant feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interview Type Selection */}
            {!sessionActive && !feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Choose Interview Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {interviewTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.type}
                          onClick={() => setSelectedType(type.type)}
                          className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                            selectedType === type.type
                              ? "border-primary bg-primary/5"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-neutral-800 mb-2">{type.title}</h3>
                          <p className="text-sm text-neutral-600 mb-4">{type.description}</p>
                          <div className="space-y-1">
                            {type.examples.map((example, index) => (
                              <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
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
                      className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg"
                    >
                      {generateQuestionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Question...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="h-5 w-5" />
                      <span>{selectedTypeInfo?.title} in Progress</span>
                    </CardTitle>
                    <Badge className={`bg-gradient-to-r ${selectedTypeInfo?.color} text-white`}>
                      {selectedType.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-neutral-800 mb-3">Interview Question:</h3>
                    <p className="text-neutral-700 leading-relaxed">{currentQuestion}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Your Response:
                    </label>
                    <Textarea
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Type your detailed response here..."
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={submitResponse}
                      disabled={!userResponse.trim() || submitResponseMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {submitResponseMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        "Submit Response"
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetInterview}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Display */}
            {feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Interview Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-2xl font-bold mb-4">
                      {feedback.score}
                    </div>
                    <p className="text-lg font-semibold text-neutral-800">
                      Score: {feedback.score}/100
                    </p>
                  </div>
                  
                  <div className="bg-neutral-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-neutral-800 mb-3">Detailed Feedback:</h3>
                    <p className="text-neutral-700 leading-relaxed">{feedback.feedback}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-800 mb-3">Strengths:</h3>
                      <ul className="space-y-2">
                        {feedback.strengths?.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-neutral-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-red-800 mb-3">Areas for Improvement:</h3>
                      <ul className="space-y-2">
                        {feedback.improvements?.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-neutral-700">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button onClick={startInterview} className="bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4 mr-2" />
                      Try Another Question
                    </Button>
                    <Button variant="outline" onClick={resetInterview}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Choose Different Type
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Interview History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {session.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-2xl font-bold text-primary">
                            {session.score}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                          {session.question}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500">No interview sessions yet</p>
                    <p className="text-sm text-neutral-400">Start your first mock interview!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Take your time to think before answering</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use the STAR method for behavioral questions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>Explain your thought process clearly</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
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