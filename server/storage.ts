import { 
  type User, 
  type InsertUser, 
  type Course, 
  type InsertCourse,
  type ChatMessage,
  type InsertChatMessage,
  type SkillProgress,
  type InsertSkillProgress,
  type Activity,
  type InsertActivity,
  type InterviewSession,
  type InsertInterviewSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Course methods
  getCourses(): Promise<Course[]>;
  getRecommendedCourses(userId: string): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Chat methods
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Skill progress methods
  getSkillProgress(userId: string): Promise<SkillProgress[]>;
  updateSkillProgress(userId: string, skillName: string, progress: number): Promise<SkillProgress>;

  // Activity methods
  getActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Interview methods
  getInterviewSessions(userId: string): Promise<InterviewSession[]>;
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private chatMessages: Map<string, ChatMessage>;
  private skillProgress: Map<string, SkillProgress>;
  private activities: Map<string, Activity>;
  private interviewSessions: Map<string, InterviewSession>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.chatMessages = new Map();
    this.skillProgress = new Map();
    this.activities = new Map();
    this.interviewSessions = new Map();

    // Initialize with sample courses
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleCourses: Course[] = [
      {
        id: randomUUID(),
        title: "Deep Learning Fundamentals",
        description: "Master neural networks and deep learning with hands-on projects.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        difficulty: "Beginner",
        duration: "12 weeks",
        rating: 48,
        category: "AI/ML",
        isRecommended: true,
      },
      {
        id: randomUUID(),
        title: "Advanced Python for Data Science",
        description: "Learn advanced Python techniques for data analysis and visualization.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        difficulty: "Intermediate",
        duration: "8 weeks",
        rating: 49,
        category: "Data Science",
        isRecommended: false,
      },
    ];

    sampleCourses.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      role: insertUser.role || "student",
      photoURL: insertUser.photoURL || null,
      skills: insertUser.skills || [],
      credits: insertUser.credits || 0,
      internshipHours: insertUser.internshipHours || 0,
      certificates: insertUser.certificates || 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getRecommendedCourses(userId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isRecommended);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = { 
      ...insertCourse, 
      id,
      imageUrl: insertCourse.imageUrl || null,
      rating: insertCourse.rating || null,
      isRecommended: insertCourse.isRecommended || null,
    };
    this.courses.set(id, course);
    return course;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
      isAI: insertMessage.isAI || null,
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getSkillProgress(userId: string): Promise<SkillProgress[]> {
    return Array.from(this.skillProgress.values())
      .filter(skill => skill.userId === userId);
  }

  async updateSkillProgress(userId: string, skillName: string, progress: number): Promise<SkillProgress> {
    const existing = Array.from(this.skillProgress.values())
      .find(skill => skill.userId === userId && skill.skillName === skillName);

    if (existing) {
      existing.progress = progress;
      existing.updatedAt = new Date();
      this.skillProgress.set(existing.id, existing);
      return existing;
    } else {
      const id = randomUUID();
      const skillProgressRecord: SkillProgress = {
        id,
        userId,
        skillName,
        progress,
        updatedAt: new Date(),
      };
      this.skillProgress.set(id, skillProgressRecord);
      return skillProgressRecord;
    }
  }

  async getActivities(userId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getInterviewSessions(userId: string): Promise<InterviewSession[]> {
    return Array.from(this.interviewSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createInterviewSession(insertSession: InsertInterviewSession): Promise<InterviewSession> {
    const id = randomUUID();
    const session: InterviewSession = { 
      ...insertSession, 
      id,
      createdAt: new Date(),
      feedback: insertSession.feedback || null,
      score: insertSession.score || null,
    };
    this.interviewSessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
