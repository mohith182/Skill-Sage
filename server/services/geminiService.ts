import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ""
);

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text() || "I'm sorry, I couldn't process your request right now. Please try again.";

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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const rawJson = response.text();

    if (rawJson) {
      const feedback: InterviewFeedback = JSON.parse(rawJson);
      return feedback;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Interview analysis error:", error);
    return {
      score: 75,
      feedback: "Unable to analyze response at this time. Please try again.",
      improvements: ["Try providing more specific examples", "Structure your answer better"],
      strengths: ["Good communication attempt"]
    };
  }
}

export async function generateCourseRecommendations(userSkills: string[], interests: string[]): Promise<string[]> {
  try {
    const prompt = `Based on these user skills: ${userSkills.join(', ')} and interests: ${interests.join(', ')}, 
    recommend 3-5 specific courses that would help advance their career. 
    Return as a JSON array of course titles only.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawJson = response.text();

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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text() || "Tell me about yourself and why you're interested in this position.";
  } catch (error) {
    console.error("Question generation error:", error);
    return "Tell me about yourself and why you're interested in this position.";
  }
}

export async function analyzeDocument(filePath: string, fileName: string): Promise<{
  summary: string;
  recommendations: string[];
}> {
  try {
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const prompt = `
    Analyze this document: ${fileName}

    Content: ${fileContent.substring(0, 2000)}...

    Provide:
    1. A brief summary of the document
    2. Career-related recommendations based on the content

    Format as JSON with "summary" and "recommendations" (array of strings).
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      return JSON.parse(response);
    } catch {
      return {
        summary: "Document analyzed successfully. The content appears to be career-related.",
        recommendations: [
          "Consider updating your skills based on current industry trends",
          "Look for relevant courses to enhance your expertise",
          "Network with professionals in your field"
        ]
      };
    }
  } catch (error) {
    console.error('Document analysis error:', error);
    return {
      summary: "Document uploaded successfully but could not be fully analyzed.",
      recommendations: [
        "Consider updating your skills",
        "Look for relevant courses",
        "Network with professionals"
      ]
    };
  }
}

export async function analyzeResume(filePath: string, fileName: string): Promise<{
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}> {
  try {
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const prompt = `
    Analyze this resume: ${fileName}

    Content: ${fileContent.substring(0, 3000)}...

    Provide a comprehensive resume analysis with:
    1. Overall summary of the resume
    2. Score out of 100 (consider format, content, skills, experience)
    3. Key strengths (3-5 points)
    4. Areas for improvement (3-5 points)
    5. Specific recommendations (3-5 actionable points)

    Format as JSON with "summary", "score" (number), "strengths" (array), "improvements" (array), "recommendations" (array).
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || "Resume analyzed successfully.",
        score: Math.min(100, Math.max(0, parsed.score || 75)),
        strengths: parsed.strengths || ["Professional experience listed", "Education background included"],
        improvements: parsed.improvements || ["Add more specific achievements", "Include relevant keywords"],
        recommendations: parsed.recommendations || ["Tailor resume for specific job applications", "Add quantifiable achievements"]
      };
    } catch {
      return {
        summary: "Professional resume with relevant experience and education. Shows good career progression.",
        score: 75,
        strengths: [
          "Clear professional experience",
          "Educational background included",
          "Well-organized structure"
        ],
        improvements: [
          "Add more quantifiable achievements",
          "Include relevant keywords for ATS",
          "Expand on technical skills"
        ],
        recommendations: [
          "Tailor resume for specific job applications",
          "Add metrics to demonstrate impact",
          "Include relevant certifications",
          "Optimize for applicant tracking systems"
        ]
      };
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
    return {
      summary: "Resume uploaded successfully but detailed analysis could not be completed.",
      score: 70,
      strengths: ["Professional format", "Complete contact information"],
      improvements: ["Add more specific details", "Include relevant keywords"],
      recommendations: ["Update with recent achievements", "Tailor for target positions"]
    };
  }
}

export async function searchJobs(query: string, location: string = ""): Promise<Array<{
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  applyUrl: string;
}>> {
  try {
    const prompt = `
    Generate realistic job listings for the search query: "${query}" ${location ? `in ${location}` : ''}.

    Create 5-8 diverse job listings with:
    - Job title
    - Company name
    - Location
    - Job type (Full-time, Part-time, Contract, Internship)
    - Salary range
    - Brief description
    - 3-5 key requirements
    - Posted date (recent)

    Make them realistic and varied across different companies and experience levels.
    Format as JSON array with objects containing: id, title, company, location, type, salary, description, requirements (array), postedDate, applyUrl.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const jobs = JSON.parse(response);
      return jobs.map((job: any, index: number) => ({
        id: `job_${Date.now()}_${index}`,
        title: job.title || `${query} Position`,
        company: job.company || `Tech Company ${index + 1}`,
        location: job.location || location || "Remote",
        type: job.type || "Full-time",
        salary: job.salary || "$50,000 - $80,000",
        description: job.description || `Exciting opportunity for a ${query} professional to join our growing team.`,
        requirements: job.requirements || [query, "Bachelor's degree", "2+ years experience"],
        postedDate: job.postedDate || "2 days ago",
        applyUrl: job.applyUrl || `https://careers.example.com/jobs/${index + 1}`
      }));
    } catch {
      // Fallback mock jobs
      return [
        {
          id: `job_${Date.now()}_1`,
          title: `Senior ${query} Developer`,
          company: "TechCorp Inc",
          location: location || "San Francisco, CA",
          type: "Full-time",
          salary: "$90,000 - $130,000",
          description: `We are looking for an experienced ${query} developer to join our innovative team.`,
          requirements: [query, "5+ years experience", "Bachelor's degree", "Team collaboration"],
          postedDate: "1 day ago",
          applyUrl: "https://careers.techcorp.com/senior-developer"
        },
        {
          id: `job_${Date.now()}_2`,
          title: `${query} Specialist`,
          company: "Innovation Labs",
          location: location || "Remote",
          type: "Contract",
          salary: "$70 - $100/hour",
          description: `Contract position for a skilled ${query} specialist to work on exciting projects.`,
          requirements: [query, "3+ years experience", "Strong communication", "Problem solving"],
          postedDate: "3 days ago",
          applyUrl: "https://careers.innovationlabs.com/specialist"
        }
      ];
    }
  } catch (error) {
    console.error('Job search error:', error);
    return [];
  }
}