import express from "express";
import { createServer } from "http";
import { db } from "./db";
import { courses, chatMessages } from "../shared/schema";
import { getCareerAdvice } from "./services/geminiService";
import { authenticateUser } from "./authMiddleware";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeResume, analyzeDocument, generateInterviewQuestion, analyzeInterviewResponse, searchJobs } from "./services/geminiService";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertChatMessageSchema,
  insertSkillProgressSchema,
  insertActivitySchema,
  insertInterviewSessionSchema 
} from "../shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: express.Express) {
  
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      console.log("Creating new user:", req.body);
      const userData = insertUserSchema.parse(req.body);
      // Use Firebase UID as the database ID for consistency
      const userWithId = { ...userData, id: req.body.firebaseUid };
      const user = await storage.createUser(userWithId);
      console.log("User created successfully:", user.id);
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data", error: error?.message || "Unknown error" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get courses" });
    }
  });

  app.get("/api/courses/recommended/:userId", async (req, res) => {
    try {
      const courses = await storage.getRecommendedCourses(req.params.userId);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recommended courses" });
    }
  });

  // Search for course by name
  app.get("/api/courses/search/:courseName", async (req, res) => {
    try {
      const courseName = decodeURIComponent(req.params.courseName);
      const course = await storage.searchCourseByName(courseName);
      
      if (!course) {
        return res.status(404).json({ 
          message: "Course not found in our database",
          courseraUrl: `https://www.coursera.org/search?query=${encodeURIComponent(courseName)}`,
          isPaid: true,
          pricingInfo: "Pricing information available on Coursera"
        });
      }

      const courseraUrl = `https://www.coursera.org/search?query=${encodeURIComponent(course.title)}`;
      const isPaid = course.price && course.price !== "Free" && course.price !== "$0.00";
      
      res.json({
        course,
        courseraUrl,
        isPaid,
        pricingInfo: isPaid ? `This course costs ${course.price}` : "This course is free"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search course" });
    }
  });

  // Search for multiple courses
  app.get("/api/courses/search-multiple/:searchTerm", async (req, res) => {
    try {
      const searchTerm = decodeURIComponent(req.params.searchTerm);
      const courses = await storage.searchCourses(searchTerm);
      
      const coursesWithUrls = courses.map(course => ({
        ...course,
        courseraUrl: `https://www.coursera.org/search?query=${encodeURIComponent(course.title)}`,
        isPaid: course.price && course.price !== "Free" && course.price !== "$0.00",
        pricingInfo: course.price && course.price !== "Free" && course.price !== "$0.00" 
          ? `This course costs ${course.price}` 
          : "This course is free"
      }));

      res.json({
        courses: coursesWithUrls,
        count: courses.length,
        searchTerm
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search courses" });
    }
  });

  // Get chat messages for a user
  app.get("/api/chat", authenticateUser, async (req, res) => {
    const user = (req as any).user;
    
    try {
      const messages = await db.select().from(chatMessages)
        .where(eq(chatMessages.userId, user.uid))
        .orderBy(chatMessages.createdAt);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Protect the chat endpoint with the new middleware
  app.post("/api/chat", authenticateUser, async (req, res) => {
    const { message } = req.body;
    const user = (req as any).user;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    try {
      // Save user's message
      await db.insert(chatMessages).values({
        userId: user.uid,
        content: message,
        isAI: false,
      });

      // Get AI's response
      const advice = await getCareerAdvice(message);
      
      // Save AI's response
      await db.insert(chatMessages).values({
        userId: user.uid,
        content: advice.message,
        isAI: true,
      });

      // Return the AI response
      res.json({ message: advice.message, suggestions: advice.suggestions });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Chat sessions management
  app.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      // For now, return a default session structure
      // This can be enhanced to store actual sessions in the database
      const sessions = [
        {
          id: "default",
          name: "Default Chat",
          createdAt: new Date().toISOString(),
          messageCount: 0
        }
      ];
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat sessions" });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const { userId, name } = req.body;
      const session = {
        id: `session_${Date.now()}`,
        name: name || "New Chat",
        createdAt: new Date().toISOString(),
        messageCount: 0
      };
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.delete("/api/chat/sessions/:sessionId", async (req, res) => {
    try {
      // For now, just return success
      // This can be enhanced to actually delete sessions from database
      res.json({ message: "Session deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chat session" });
    }
  });

  // Skills progress routes
  app.get("/api/skills/:userId", async (req, res) => {
    try {
      const skills = await storage.getSkillProgress(req.params.userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills progress" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const { userId, skillName, progress } = req.body;
      const skill = await storage.updateSkillProgress(userId, skillName, progress);
      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill progress" });
    }
  });

  // Activity routes
  app.get("/api/activities/:userId", async (req, res) => {
    try {
      const activities = await storage.getActivities(req.params.userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Interview routes
  app.get("/api/interview/sessions/:userId", async (req, res) => {
    try {
      const sessions = await storage.getInterviewSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get interview sessions" });
    }
  });

  app.post("/api/interview/question", async (req, res) => {
    try {
      const { type } = req.body;
      const question = await generateInterviewQuestion(type);
      res.json({ question });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate interview question" });
    }
  });

  app.post("/api/interview/response", async (req, res) => {
    try {
      const { userId, question, response, type } = req.body;
      
      // Get AI feedback
      const feedback = await analyzeInterviewResponse(question, response, type);
      
      // Save interview session
      const session = await storage.createInterviewSession({
        userId,
        type,
        question,
        userResponse: response,
        feedback: feedback.feedback,
        score: feedback.score,
      });

      // Create activity
      await storage.createActivity({
        userId,
        type: "interview_session",
        description: `Completed ${type} interview with score ${feedback.score}`,
      });

      res.json({
        session,
        ...feedback
      });
    } catch (error) {
      console.error("Interview response error:", error);
      res.status(500).json({ message: "Failed to process interview response" });
    }
  });

  // Course recommendations using AI
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { skills, interests } = req.body;
      const recommendations = await generateCourseRecommendations(skills, interests);
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // File upload and document analysis
  app.post("/api/upload-document", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { userId } = req.body;
      const filePath = req.file.path;
      const fileName = req.file.originalname;

      // Analyze document with AI
      const analysis = await analyzeDocument(filePath, fileName);

      // Save analysis as a chat message
      const aiMessage = await storage.createChatMessage({
        userId,
        content: `📄 **Document Analysis for "${fileName}"**\n\n${analysis.summary}\n\n**Career Recommendations:**\n${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}`,
        isAI: true,
        sessionId: "default",
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({ 
        message: "Document analyzed successfully",
        analysis,
        chatMessage: aiMessage
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  // Resume analysis
  app.post("/api/resume/analyze", upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "No resume file uploaded",
          error: "Please select a file to upload"
        });
      }

      const { userId, fileType, fileSize, jobKeywords } = req.body;
      const filePath = req.file.path;
      const fileName = req.file.originalname;

      console.log(`Processing resume: ${fileName} (Type: ${fileType}, Size: ${fileSize})`);

      // Analyze resume with AI (enhanced with file type and keywords)
      const analysis = await analyzeResume(filePath, fileName, fileType, jobKeywords);

      console.log(`Analysis completed with score: ${analysis.overallScore || analysis.score}`);

      // Create activity
      await storage.createActivity({
        userId: userId || 'anonymous',
        type: "resume_review",
        description: `Resume "${fileName}" analyzed with score ${analysis.overallScore || analysis.score}/100`,
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({ 
        message: "Resume analyzed successfully",
        analysis: {
          score: analysis.score,
          summary: analysis.summary,
          strengths: analysis.strengths || [],
          improvements: analysis.improvements || [],
          atsOptimization: analysis.atsOptimization || [],
          extractedData: {
            name: analysis.extractedData?.name || 'N/A',
            email: analysis.extractedData?.email || 'N/A',
            phone: analysis.extractedData?.phone || 'N/A',
            experience: analysis.extractedData?.experience || [],
            education: analysis.extractedData?.education || [],
            skills: analysis.extractedData?.skills || []
          },
          keywordAnalysis: analysis.keywordAnalysis || {
            found: [],
            missing: [],
            suggestions: []
          },
          formattingScore: analysis.formattingScore || analysis.score,
          contentScore: analysis.contentScore || analysis.score,
          atsScore: analysis.atsScore || analysis.score,
          overallScore: analysis.overallScore || analysis.score
        }
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      
      // Clean up file if it exists
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Failed to clean up file:", e);
        }
      }

      res.status(500).json({ 
        message: "Failed to analyze resume",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Job search - GET endpoint for frontend compatibility
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const { query, location, userId } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      // Get job recommendations from AI
      const jobs = await searchJobs(query as string, location as string);

      // Create activity if userId is provided
      if (userId) {
        await storage.createActivity({
          userId: userId as string,
          type: "job_search",
          description: `Searched for "${query}" jobs${location ? ` in ${location}` : ''}`,
        });
      }

      res.json({ 
        jobs,
        query,
        location: location || "Any location"
      });
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  // Job search - POST endpoint (enhanced)
  app.post("/api/jobs/search", async (req, res) => {
    try {
      const { query, location, userId } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Get job recommendations from AI
      const jobs = await searchJobs(query, location);

      // Create activity
      if (userId) {
        await storage.createActivity({
          userId,
          type: "job_search",
          description: `Searched for "${query}" jobs${location ? ` in ${location}` : ''}`,
        });
      }

      res.json({ 
        jobs,
        query,
        location: location || "Any location"
      });
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  // Resume routes
  app.post("/api/resume/save", async (req, res) => {
    try {
      const { userId, resumeData } = req.body;
      
      if (!userId || !resumeData) {
        return res.status(400).json({ message: "User ID and resume data are required" });
      }

      // Save resume data to storage
      await storage.saveResume(userId, resumeData);

      // Create activity
      await storage.createActivity({
        userId,
        type: "resume_saved",
        description: "Resume saved successfully",
      });

      res.json({ message: "Resume saved successfully" });
    } catch (error) {
      console.error("Resume save error:", error);
      res.status(500).json({ message: "Failed to save resume" });
    }
  });

  app.get("/api/resume/load", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Load resume data from storage
      const resumeData = await storage.getResume(userId as string);
      
      if (!resumeData) {
        return res.status(404).json({ message: "No resume found for this user" });
      }

      res.json({ resumeData });
    } catch (error) {
      console.error("Resume load error:", error);
      res.status(500).json({ message: "Failed to load resume" });
    }
  });

  app.delete("/api/resume/delete", async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Delete resume data from storage
      await storage.deleteResume(userId as string);

      // Create activity
      await storage.createActivity({
        userId: userId as string,
        type: "resume_deleted",
        description: "Resume deleted",
      });

      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Resume delete error:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
