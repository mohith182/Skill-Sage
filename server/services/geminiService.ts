import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
});

export interface CareerAdviceResponse {
  message: string;
  suggestions?: string[];
  resources?: string[];
}

export interface InterviewFeedback {
  score: number;
  feedback: string;
  improvements: string[];
  strengths: string[];
}

export async function getCareerAdvice(prompt: string, userContext?: any): Promise<CareerAdviceResponse> {
  try {
    const contextPrompt = userContext ? 
      `User context: ${JSON.stringify(userContext)}\n\nUser question: ${prompt}` : 
      prompt;

    const fullPrompt = `You are SkillSage, an AI-powered career mentor. Provide helpful, encouraging, and actionable career advice. 
    Keep responses conversational but professional. Focus on practical steps and resources.
    
    ${contextPrompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const text = response.text || "I'm sorry, I couldn't process your request right now. Please try again.";

    return {
      message: text,
      suggestions: [], // Could be enhanced to parse suggestions from response
      resources: [],
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get career advice. Please try again later.");
  }
}

export async function analyzeInterviewResponse(
  question: string, 
  userResponse: string, 
  interviewType: string
): Promise<InterviewFeedback> {
  try {
    const systemPrompt = `You are an interview assessment AI. Analyze the candidate's response and provide constructive feedback.
    
    Interview Type: ${interviewType}
    Question: ${question}
    Candidate Response: ${userResponse}
    
    Provide feedback in JSON format with:
    - score (1-100)
    - feedback (detailed assessment)
    - improvements (array of improvement suggestions)
    - strengths (array of identified strengths)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            feedback: { type: "string" },
            improvements: { 
              type: "array", 
              items: { type: "string" } 
            },
            strengths: { 
              type: "array", 
              items: { type: "string" } 
            },
          },
          required: ["score", "feedback", "improvements", "strengths"],
        },
      },
      contents: systemPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const feedback: InterviewFeedback = JSON.parse(rawJson);
      return feedback;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw new Error("Failed to analyze interview response. Please try again later.");
  }
}

export async function generateCourseRecommendations(userSkills: string[], interests: string[]): Promise<string[]> {
  try {
    const prompt = `Based on these user skills: ${userSkills.join(', ')} and interests: ${interests.join(', ')}, 
    recommend 3-5 specific courses that would help advance their career. 
    Return as a JSON array of course titles only.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Course recommendation error:", error);
    return [];
  }
}

export async function generateInterviewQuestion(interviewType: string): Promise<string> {
  try {
    const prompt = `Generate a realistic ${interviewType} interview question. 
    Return only the question without any additional formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Tell me about yourself and why you're interested in this position.";
  } catch (error) {
    console.error("Question generation error:", error);
    return "Tell me about yourself and why you're interested in this position.";
  }
}
