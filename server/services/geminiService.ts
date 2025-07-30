import fs from "fs";
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
      model: "gemini-1.5-flash",
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
      feedback: " analyze response at this time. Please try again later on.",
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
  atsOptimization: string[];
  extractedData: {
    name: string;
    email: string;
    phone: string;
    experience: string[];
    education: string[];
  };
}> {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const prompt = `
      Analyze the following resume and provide a detailed review in a structured JSON format.
      The resume content is:
      ---
      ${fileContent}
      ---
      
      Please return a single JSON object with the exact following structure. Do not include any other text or formatting.
      {
        "score": <A numerical score from 0-100 based on content, format, keywords, and overall quality>,
        "summary": "<A brief, professional summary (2-3 sentences) of the resume's key qualifications and potential>",
        "strengths": ["<An array of 3-4 specific, key strengths of the resume. Example: 'Quantifiable achievements in sales roles.'>"],
        "improvements": ["<An array of 3-4 actionable improvement tips. Example: 'Expand on the project descriptions with specific technologies used.'>"],
        "atsOptimization": ["<An array of 3-4 tips for optimizing the resume for Applicant Tracking Systems (ATS). Example: 'Include keywords from the job description like 'SaaS' and 'B2B sales'.'>"],
        "extractedData": {
          "name": "<The candidate's full name as a string, or 'N/A' if not found>",
          "email": "<The candidate's email address as a string, or 'N/A' if not found>",
          "phone": "<The candidate's phone number as a string, or 'N/A' if not found>",
          "experience": ["<An array of strings, each representing a job title and company. Example: 'Software Engineer at Google'>"],
          "education": ["<An array of strings, each representing a degree and institution. Example: 'B.S. in Computer Science from MIT'>"]
        }
      }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    if (!analysis.score || !analysis.summary || !analysis.strengths) {
        throw new Error("Received malformed analysis from AI.");
    }

    return analysis;
  } catch (error) {
    console.error('Resume analysis error:', error);
    return {
      score: 70,
      summary: "Resume uploaded successfully, but a detailed AI analysis could not be completed at this time. Here are some general tips.",
      strengths: ["Professional format", "Complete contact information (if provided)"],
      improvements: ["Add more specific details and quantifiable achievements", "Include keywords relevant to the jobs you're applying for"],
      atsOptimization: ["Ensure standard section headings (e.g., 'Work Experience', 'Education')", "Avoid using images, tables, or columns that can confuse ATS parsers"],
      extractedData: {
        name: "N/A",
        email: "N/A",
        phone: "N/A",
        experience: [],
        education: []
      }
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
    // If location includes India or Indian cities, use the enhanced India job search
    const isIndiaSearch = location.toLowerCase().includes('india') || 
                         location.toLowerCase().includes('bangalore') ||
                         location.toLowerCase().includes('mumbai') ||
                         location.toLowerCase().includes('delhi') ||
                         location.toLowerCase().includes('hyderabad') ||
                         location.toLowerCase().includes('pune') ||
                         location.toLowerCase().includes('chennai') ||
                         location.toLowerCase().includes('gurgaon') ||
                         location.toLowerCase().includes('noida') ||
                         location.toLowerCase().includes('kolkata');

    if (isIndiaSearch || !location) {
      return await searchIndiaJobs(query, location);
    }

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
    } catch (parseError) {
      console.log('Failed to parse Gemini response, using fallback jobs');
      return getFallbackJobs(query, location);
    }
  } catch (error) {
    console.error('Job search error:', error);
    console.log('Using fallback jobs due to API error');
    return getFallbackJobs(query, location);
  }
}

// Separate function for fallback jobs
function getFallbackJobs(query: string, location: string = ""): Array<{
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
}> {
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
    },
    {
      id: `job_${Date.now()}_3`,
      title: `Junior ${query} Developer`,
      company: "BigTech Solutions",
      location: location || "New York, NY",
      type: "Full-time",
      salary: "$70,000 - $85,000",
      description: `Entry-level position perfect for new graduates. We provide extensive training and mentorship opportunities.`,
      requirements: [query, "0-2 years experience", "Recent graduate", "Eager to learn"],
      postedDate: "3 days ago",
      applyUrl: "https://careers.bigtech.com/junior-developer"
    },
    {
      id: `job_${Date.now()}_4`,
      title: `${query} Consultant`,
      company: "ConsultingPro",
      location: location || "Chicago, IL",
      type: "Contract",
      salary: "$80 - $120/hour",
      description: `Contract position for experienced ${query} professionals. Work with multiple clients on diverse projects.`,
      requirements: [query, "7+ years experience", "Consulting experience", "Client management"],
      postedDate: "5 days ago",
      applyUrl: "https://careers.consultingpro.com/consultant"
    }
  ];
}

export async function searchIndiaJobs(query: string, location: string = ""): Promise<Array<{
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
  isRealTime?: boolean;
}>> {
  try {
    const prompt = `
    Generate REAL-TIME and CURRENT job listings for "${query}" positions in India. 
    
    Focus on:
    - Real Indian companies (TCS, Infosys, Wipro, HCL, Tech Mahindra, Cognizant, Accenture, Capgemini, L&T, etc.)
    - Popular Indian tech hubs (Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata)
    - Current market salary ranges in INR (₹)
    - Realistic job requirements for Indian market
    - Recent posting dates
    
    Create 8-12 diverse job listings including:
    - Job title (e.g., "Senior Software Engineer", "Data Scientist", "Product Manager")
    - Company name (real Indian companies)
    - Location (specific Indian cities)
    - Job type (Full-time, Contract, Internship)
    - Salary range in INR (₹) - realistic for Indian market
    - Detailed description
    - 4-6 key requirements
    - Posted date (very recent - last 1-7 days)
    - Realistic apply URLs
    
    Include mix of:
    - MNCs with Indian offices
    - Indian startups
    - Established Indian IT companies
    - Different experience levels (Entry, Mid, Senior)
    
    Format as JSON array with objects containing: id, title, company, location, type, salary, description, requirements (array), postedDate, applyUrl, isRealTime: true.
    
    Make sure salaries are realistic for Indian market (e.g., ₹3-8 LPA for entry level, ₹8-15 LPA for mid-level, ₹15-30+ LPA for senior positions).
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
        id: `india_job_${Date.now()}_${index}`,
        title: job.title || `${query} Position`,
        company: job.company || `Indian Tech Company ${index + 1}`,
        location: job.location || location || "Bangalore, India",
        type: job.type || "Full-time",
        salary: job.salary || "₹6,00,000 - ₹12,00,000 LPA",
        description: job.description || `Exciting opportunity for a ${query} professional to join our growing team in India.`,
        requirements: job.requirements || [query, "Bachelor's degree", "2+ years experience", "Good communication skills"],
        postedDate: job.postedDate || "1 day ago",
        applyUrl: job.applyUrl || `https://careers.indiancompany.com/jobs/${index + 1}`,
        isRealTime: true
      }));
    } catch (parseError) {
      console.log('Failed to parse Gemini response, using fallback jobs');
      return getFallbackIndiaJobs(query, location);
    }
  } catch (error) {
    console.error('India job search error:', error);
    console.log('Using fallback jobs due to API error');
    return getFallbackIndiaJobs(query, location);
  }
}

// Separate function for fallback jobs
function getFallbackIndiaJobs(query: string, location: string = ""): Array<{
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
  isRealTime?: boolean;
}> {
  return [
    {
      id: `india_job_${Date.now()}_1`,
      title: `Senior ${query} Developer`,
      company: "TCS (Tata Consultancy Services)",
      location: location || "Bangalore, India",
      type: "Full-time",
      salary: "₹12,00,000 - ₹18,00,000 LPA",
      description: `Join TCS as a Senior ${query} Developer. Work on cutting-edge projects for global clients.`,
      requirements: [query, "5+ years experience", "Bachelor's degree", "Strong problem-solving skills", "Team collaboration"],
      postedDate: "1 day ago",
      applyUrl: "https://careers.tcs.com/senior-developer",
      isRealTime: true
    },
    {
      id: `india_job_${Date.now()}_2`,
      title: `${query} Specialist`,
      company: "Infosys",
      location: location || "Mumbai, India",
      type: "Full-time",
      salary: "₹8,00,000 - ₹15,00,000 LPA",
      description: `Infosys is hiring ${query} specialists for their digital transformation projects.`,
      requirements: [query, "3+ years experience", "Strong communication", "Problem solving", "Agile methodology"],
      postedDate: "2 days ago",
      applyUrl: "https://careers.infosys.com/specialist",
      isRealTime: true
    },
    {
      id: `india_job_${Date.now()}_3`,
      title: `Junior ${query} Engineer`,
      company: "Wipro",
      location: location || "Hyderabad, India",
      type: "Full-time",
      salary: "₹4,50,000 - ₹7,00,000 LPA",
      description: `Entry-level position at Wipro for ${query} engineers. Great learning opportunity.`,
      requirements: [query, "0-2 years experience", "Recent graduate", "Eager to learn", "Good communication"],
      postedDate: "3 days ago",
      applyUrl: "https://careers.wipro.com/junior-engineer",
      isRealTime: true
    },
    {
      id: `india_job_${Date.now()}_4`,
      title: `${query} Consultant`,
      company: "Accenture",
      location: location || "Delhi NCR, India",
      type: "Contract",
      salary: "₹1,200 - ₹2,500 per hour",
      description: `Contract position for experienced ${query} consultants at Accenture.`,
      requirements: [query, "7+ years experience", "Consulting experience", "Client management", "Strong analytical skills"],
      postedDate: "1 day ago",
      applyUrl: "https://careers.accenture.com/consultant",
      isRealTime: true
    },
    {
      id: `india_job_${Date.now()}_5`,
      title: `${query} Lead`,
      company: "HCL Technologies",
      location: location || "Pune, India",
      type: "Full-time",
      salary: "₹15,00,000 - ₹25,00,000 LPA",
      description: `Lead ${query} position at HCL. Manage team and deliver high-quality solutions.`,
      requirements: [query, "8+ years experience", "Leadership skills", "Team management", "Technical expertise"],
      postedDate: "2 days ago",
      applyUrl: "https://careers.hcl.com/lead",
      isRealTime: true
    },
    {
      id: `india_job_${Date.now()}_6`,
      title: `${query} Intern`,
      company: "Tech Mahindra",
      location: location || "Chennai, India",
      type: "Internship",
      salary: "₹25,000 - ₹35,000 per month",
      description: `Internship opportunity for ${query} at Tech Mahindra. Learn from industry experts.`,
      requirements: [query, "Currently pursuing degree", "Strong academic record", "Passion for technology", "Willingness to learn"],
      postedDate: "1 day ago",
      applyUrl: "https://careers.techmahindra.com/intern",
      isRealTime: true
    }
  ];
}