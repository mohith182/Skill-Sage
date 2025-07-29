import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, Users, TrendingUp, Mic, Play } from "lucide-react";

interface InterviewSimulatorProps {
  userId: string;
}

const interviewTypes = [
  {
    type: "technical",
    icon: Code,
    title: "Technical",
    description: "Coding & problem solving",
  },
  {
    type: "behavioral",
    icon: Users,
    title: "Behavioral",
    description: "Soft skills & experience",
  },
  {
    type: "case_study",
    icon: TrendingUp,
    title: "Case Study",
    description: "Business scenarios",
  },
];

export function InterviewSimulator({ userId }: InterviewSimulatorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const startInterviewMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", "/api/interview/question", { type });
      return response.json();
    },
    onSuccess: (data) => {
      // In a real app, this would navigate to interview interface
      console.log("Starting interview with question:", data.question);
      alert(`Interview Started!\nQuestion: ${data.question}`);
    },
  });

  const handleStartInterview = () => {
    if (!selectedType) {
      // Default to technical if none selected
      setSelectedType("technical");
      startInterviewMutation.mutate("technical");
    } else {
      startInterviewMutation.mutate(selectedType);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            Mock Interview Simulator
          </h3>
          <p className="text-neutral-600 text-sm">
            Practice with AI-powered interview scenarios
          </p>
        </div>
        <div className="w-16 h-16 bg-gradient-to-r from-secondary to-purple-600 rounded-2xl flex items-center justify-center">
          <Mic className="text-white h-8 w-8" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {interviewTypes.map((interview) => {
          const Icon = interview.icon;
          return (
            <Card
              key={interview.type}
              className={`cursor-pointer transition-all ${
                selectedType === interview.type
                  ? "ring-2 ring-purple-500 bg-purple-50"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setSelectedType(interview.type)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <Icon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-neutral-800 mb-1">
                    {interview.title}
                  </h4>
                  <p className="text-sm text-neutral-600">{interview.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Button
        className="w-full bg-gradient-to-r from-secondary to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
        onClick={handleStartInterview}
        disabled={startInterviewMutation.isPending}
      >
        <Play className="mr-2 h-5 w-5" />
        {startInterviewMutation.isPending ? "Starting..." : "Start Interview Session"}
      </Button>
    </div>
  );
}
