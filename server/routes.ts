import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  getCareerAdvice, 
  analyzeInterviewResponse, 
  generateCourseRecommendations,
  generateInterviewQuestion 
} from "./services/geminiService";
import { 
  insertChatMessageSchema, 
  insertActivitySchema, 
  insertInterviewSessionSchema,
  insertUserSchema 
} from "@shared/schema";

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
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
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

  // Chat routes
  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, content } = req.body;
      
      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        content,
        isAI: false,
      });

      // Get AI response
      const user = await storage.getUser(userId);
      const aiResponse = await getCareerAdvice(content, user);
      
      // Save AI message
      const aiMessage = await storage.createChatMessage({
        userId,
        content: aiResponse.message,
        isAI: true,
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
  app.get("/api/interviews/:userId", async (req, res) => {
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

  app.post("/api/interview/analyze", async (req, res) => {
    try {
      const { question, response, type, userId } = req.body;
      const feedback = await analyzeInterviewResponse(question, response, type);
      
      // Save interview session
      const session = await storage.createInterviewSession({
        userId,
        type,
        feedback: feedback.feedback,
        score: feedback.score,
      });

      res.json({ feedback, session });
    } catch (error) {
      console.error("Interview analysis error:", error);
      res.status(500).json({ message: "Failed to analyze interview response" });
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

  const httpServer = createServer(app);
  return httpServer;
}
