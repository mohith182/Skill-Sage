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
  type InsertInterviewSession,
  users,
  courses,
  chatMessages,
  skillProgress,
  activities,
  interviewSessions
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "student",
        photoURL: insertUser.photoURL || null,
        skills: insertUser.skills || [],
        credits: insertUser.credits || 0,
        internshipHours: insertUser.internshipHours || 0,
        certificates: insertUser.certificates || 0,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getRecommendedCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isRecommended, true));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values({
        ...insertCourse,
        imageUrl: insertCourse.imageUrl || null,
        rating: insertCourse.rating || null,
        isRecommended: insertCourse.isRecommended || null,
      })
      .returning();
    return course;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...insertMessage,
        isAI: insertMessage.isAI || null,
      })
      .returning();
    return message;
  }

  async getSkillProgress(userId: string): Promise<SkillProgress[]> {
    return await db
      .select()
      .from(skillProgress)
      .where(eq(skillProgress.userId, userId));
  }

  async updateSkillProgress(userId: string, skillName: string, progress: number): Promise<SkillProgress> {
    // Check if record exists first
    const [existing] = await db
      .select()
      .from(skillProgress)
      .where(and(
        eq(skillProgress.userId, userId),
        eq(skillProgress.skillName, skillName)
      ));

    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(skillProgress)
        .set({ progress, updatedAt: new Date() })
        .where(and(
          eq(skillProgress.userId, userId),
          eq(skillProgress.skillName, skillName)
        ))
        .returning();
      return updated;
    }

    // Create new record if not exists
    const [newRecord] = await db
      .insert(skillProgress)
      .values({
        userId,
        skillName,
        progress,
      })
      .returning();
    return newRecord;
  }

  async getActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getInterviewSessions(userId: string): Promise<InterviewSession[]> {
    return await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.userId, userId))
      .orderBy(interviewSessions.createdAt);
  }

  async createInterviewSession(insertSession: InsertInterviewSession): Promise<InterviewSession> {
    const [session] = await db
      .insert(interviewSessions)
      .values({
        ...insertSession,
        feedback: insertSession.feedback || null,
        score: insertSession.score || null,
      })
      .returning();
    return session;
  }
}

// Create sample data function with real course data
async function initializeSampleData() {
  const existingCourses = await db.select().from(courses);
  
  if (existingCourses.length === 0) {
    await db.insert(courses).values([
      {
        title: "Complete Python Bootcamp: Go from Zero to Hero",
        description: "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games",
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "22 hours",
        rating: 46,
        category: "Programming",
        isRecommended: true,
      },
      {
        title: "The Complete JavaScript Course 2024",
        description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory",
        imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "69 hours",
        rating: 47,
        category: "Web Development",
        isRecommended: true,
      },
      {
        title: "Machine Learning A-Z: AI, Python & R",
        description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "44 hours",
        rating: 45,
        category: "Data Science",
        isRecommended: true,
      },
      {
        title: "React - The Complete Guide 2024",
        description: "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "48 hours",
        rating: 46,
        category: "Web Development",
        isRecommended: false,
      },
      {
        title: "AWS Certified Solutions Architect",
        description: "Pass the AWS Certified Solutions Architect Associate Exam! Complete Amazon Web Services cloud training",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "26 hours",
        rating: 46,
        category: "Cloud Computing",
        isRecommended: false,
      },
      {
        title: "The Complete Node.js Developer Course",
        description: "Learn Node.js by building real-world applications with Node, Express, MongoDB, Jest, and more!",
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "35 hours",
        rating: 47,
        category: "Backend Development",
        isRecommended: true,
      },
    ]);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data
initializeSampleData().catch(console.error);
