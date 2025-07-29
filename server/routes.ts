import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { 
  getCareerAdvice, 
  analyzeInterviewResponse, 
  generateCourseRecommendations,
  generateInterviewQuestion,
  analyzeDocument 
} from "./services/geminiService";
import { 
  insertChatMessageSchema, 
  insertActivitySchema, 
  insertInterviewSessionSchema,
  insertUserSchema 
} from "@shared/schema";

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

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  app.get("/api/chat/:userId/:sessionId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.userId, req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
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

  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, content, sessionId } = req.body;
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        content,
        isAI: false,
        sessionId: sessionId || "default",
      });

      // Get AI response
      const user = await storage.getUser(userId);
      const aiResponse = await getCareerAdvice(content, user);
      
      // Save AI message
      const aiMessage = await storage.createChatMessage({
        userId,
        content: aiResponse.message,
        isAI: true,
        sessionId: sessionId || "default",
      });

      // Create activity
      await storage.createActivity({
        userId,
        type: "chat_session",
        description: "AI mentor session completed",
      });

      res.json({ userMessage, aiMessage, suggestions: aiResponse.suggestions });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
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
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      const { userId } = req.body;
      const filePath = req.file.path;
      const fileName = req.file.originalname;

      // Analyze resume with AI
      const analysis = await analyzeResume(filePath, fileName);

      // Create activity
      await storage.createActivity({
        userId,
        type: "resume_review",
        description: `Resume "${fileName}" analyzed with score ${analysis.score}/100`,
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({ 
        message: "Resume analyzed successfully",
        analysis
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  // Job search
  app.post("/api/jobs/search", async (req, res) => {
    try {
      const { query, location, userId } = req.body;
      
      // Get job recommendations from AI
      const jobs = await searchJobs(query, location);

      // Create activity
      await storage.createActivity({
        userId,
        type: "job_search",
        description: `Searched for "${query}" jobs${location ? ` in ${location}` : ''}`,
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
