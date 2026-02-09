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
import { eq, and, sql } from "drizzle-orm";

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

  // Resume methods
  saveResume(userId: string, resumeData: any): Promise<void>;
  getResume(userId: string): Promise<any | undefined>;
  deleteResume(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private courses: Map<string, Course>;
  private chatMessages: Map<string, ChatMessage>;
  private skillProgress: Map<string, SkillProgress>;
  private activities: Map<string, Activity>;
  private interviewSessions: Map<string, InterviewSession>;
  private resumes: Map<string, any>;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.chatMessages = new Map();
    this.skillProgress = new Map();
    this.activities = new Map();
    this.interviewSessions = new Map();
    this.resumes = new Map();

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

  async searchCourseByName(courseName: string): Promise<Course | undefined> {
    const courses = Array.from(this.courses.values());
    
    // First try exact match or close match in title
    let result = courses.find(course => 
      course.title.toLowerCase().includes(courseName.toLowerCase())
    );
    
    if (result) {
      return result;
    }
    
    // If no match in title, try searching in description and category
    result = courses.find(course => 
      course.description.toLowerCase().includes(courseName.toLowerCase()) ||
      course.category.toLowerCase().includes(courseName.toLowerCase())
    );
    
    return result;
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    const courses = Array.from(this.courses.values());
    
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
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

  async getChatMessages(userId: string, sessionId?: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => {
        if (sessionId && sessionId !== "default") {
          return message.userId === userId && message.sessionId === sessionId;
        }
        return message.userId === userId && (!message.sessionId || message.sessionId === "default");
      })
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage & { sessionId?: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
      isAI: insertMessage.isAI || null,
      sessionId: insertMessage.sessionId || "default",
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

  // Resume methods
  async saveResume(userId: string, resumeData: any): Promise<void> {
    this.resumes.set(userId, resumeData);
  }

  async getResume(userId: string): Promise<any | undefined> {
    return this.resumes.get(userId);
  }

  async deleteResume(userId: string): Promise<void> {
    this.resumes.delete(userId);
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

  async getRecommendedCourses(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isRecommended, true)).limit(6);
  }

  async searchCourseByName(courseName: string): Promise<Course | undefined> {
    // First try exact match or close match in title
    let result = await db.select().from(courses)
      .where(sql`LOWER(${courses.title}) LIKE LOWER(${'%' + courseName + '%'})`)
      .limit(1);
    
    if (result.length > 0) {
      return result[0];
    }
    
    // If no match in title, try searching in description and category
    result = await db.select().from(courses)
      .where(sql`LOWER(${courses.description}) LIKE LOWER(${'%' + courseName + '%'}) OR LOWER(${courses.category}) LIKE LOWER(${'%' + courseName + '%'})`)
      .limit(1);
    
    return result[0];
  }

  async searchCourses(searchTerm: string): Promise<Course[]> {
    // Search in title, description, and category
    const result = await db.select().from(courses)
      .where(sql`
        LOWER(${courses.title}) LIKE LOWER(${'%' + searchTerm + '%'}) OR 
        LOWER(${courses.description}) LIKE LOWER(${'%' + searchTerm + '%'}) OR 
        LOWER(${courses.category}) LIKE LOWER(${'%' + searchTerm + '%'})
      `)
      .limit(10);
    
    return result;
  }

  // Resume methods
  async saveResume(userId: string, resumeData: any): Promise<void> {
    // For now, we'll store resume data in a simple JSON format
    // In a real implementation, you might want to create a proper resume table
    const resumeJson = JSON.stringify(resumeData);
    
    // Store in a simple key-value format or create a resume table
    // For now, we'll use a simple approach with the existing database
    // You can extend this by creating a proper resume schema
    console.log(`Saving resume for user ${userId}:`, resumeData);
  }

  async getResume(userId: string): Promise<any | undefined> {
    // Retrieve resume data for the user
    // In a real implementation, you would query a resume table
    console.log(`Getting resume for user ${userId}`);
    return undefined; // For now, return undefined as we haven't implemented persistent storage
  }

  async deleteResume(userId: string): Promise<void> {
    // Delete resume data for the user
    console.log(`Deleting resume for user ${userId}`);
  }
}

// Create comprehensive course database with real course data
async function initializeSampleData() {
  const existingCourses = await db.select().from(courses);

  if (existingCourses.length === 0) {
    const comprehensiveCourses = [
      // Programming & Development
      {
        title: "Complete Python Bootcamp: Go from Zero to Hero",
        description: "Learn Python like a Professional Start from the basics and go all the way to creating your own applications and games",
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "22 hours",
        rating: 46,
        category: "Programming",
        isRecommended: true,
        price: "$89.99"
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
        price: "$94.99"
      },
      {
        title: "Java Programming Masterclass",
        description: "Learn Java In This Course And Become a Computer Programmer. Obtain valuable Core Java Skills And Java Certification",
        imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "80 hours",
        rating: 45,
        category: "Programming",
        isRecommended: false,
        price: "$99.99"
      },
      {
        title: "C++ Programming Course - Beginner to Advanced",
        description: "Learn C++ programming from basics to advanced topics including OOP, STL, and modern C++",
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "45 hours",
        rating: 44,
        category: "Programming",
        isRecommended: false,
        price: "$79.99"
      },
      
      // Data Science & Analytics
      {
        title: "Machine Learning A-Z: AI, Python & R",
        description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "44 hours",
        rating: 45,
        category: "Data Science",
        isRecommended: true,
        price: "$129.99"
      },
      {
        title: "Data Science and Machine Learning Bootcamp with R",
        description: "Learn how to use the R programming language for data science and machine learning and data visualization!",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "17 hours",
        rating: 43,
        category: "Data Science",
        isRecommended: false,
        price: "$109.99"
      },
      {
        title: "Python for Data Analysis and Visualization",
        description: "Learn to use Python for data analysis with pandas, matplotlib, seaborn, plotly, and more!",
        imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "25 hours",
        rating: 46,
        category: "Data Science",
        isRecommended: true,
        price: "$94.99"
      },
      {
        title: "Deep Learning Specialization",
        description: "Master Deep Learning and Break into AI. Learn neural networks, CNN, RNN, LSTM, transformers and more",
        imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "60 hours",
        rating: 48,
        category: "AI/ML",
        isRecommended: true,
        price: "$199.99"
      },
      
      // Web Development
      {
        title: "React - The Complete Guide 2024",
        description: "Dive in and learn React.js from scratch! Learn Reactjs, Hooks, Redux, React Routing, Animations, Next.js and way more!",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "48 hours",
        rating: 46,
        category: "Web Development",
        isRecommended: false,
        price: "$99.99"
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
        price: "$94.99"
      },
      {
        title: "Angular - The Complete Guide (2024 Edition)",
        description: "Master Angular and build awesome, reactive web apps with the successor of Angular.js",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "42 hours",
        rating: 45,
        category: "Web Development",
        isRecommended: false,
        price: "$99.99"
      },
      {
        title: "Vue.js 3 - The Complete Guide",
        description: "Vue.js is an awesome JavaScript Framework for building Frontend Applications! VueJS mixes the Best of Angular + React!",
        imageUrl: "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "32 hours",
        rating: 46,
        category: "Web Development",
        isRecommended: false,
        price: "$89.99"
      },
      
      // Cloud Computing & DevOps
      {
        title: "AWS Certified Solutions Architect",
        description: "Pass the AWS Certified Solutions Architect Associate Exam! Complete Amazon Web Services cloud training",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "26 hours",
        rating: 46,
        category: "Cloud Computing",
        isRecommended: false,
        price: "$79.99"
      },
      {
        title: "Docker and Kubernetes: The Complete Guide",
        description: "Build, test, and deploy Docker applications with Kubernetes while learning production-style development workflows",
        imageUrl: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "22 hours",
        rating: 45,
        category: "DevOps",
        isRecommended: false,
        price: "$109.99"
      },
      {
        title: "Microsoft Azure Fundamentals",
        description: "Learn Azure basics! Pass the AZ-900 exam. Understand cloud concepts, core Azure services, security, and pricing",
        imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "18 hours",
        rating: 44,
        category: "Cloud Computing",
        isRecommended: false,
        price: "$69.99"
      },
      
      // Mobile Development
      {
        title: "iOS & Swift - The Complete iOS App Development",
        description: "Learn iOS App Development from Beginning to End. Start with Swift fundamentals and work up to complex apps",
        imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "62 hours",
        rating: 46,
        category: "Mobile Development",
        isRecommended: false,
        price: "$99.99"
      },
      {
        title: "React Native - The Practical Guide",
        description: "Use React Native and your React knowledge to build native iOS and Android Apps - incl. Push Notifications, Hooks, Redux",
        imageUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "33 hours",
        rating: 45,
        category: "Mobile Development",
        isRecommended: false,
        price: "$94.99"
      },
      {
        title: "Flutter & Dart - The Complete Guide",
        description: "A Complete Guide to the Flutter SDK & Flutter Framework for building native iOS and Android apps",
        imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "41 hours",
        rating: 46,
        category: "Mobile Development",
        isRecommended: true,
        price: "$99.99"
      },
      
      // Design & Creative
      {
        title: "Complete Blender Creator Course",
        description: "Learn 3D Modelling for beginners. Covers all 3D art pipeline stages from modelling to final renders",
        imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "30 hours",
        rating: 47,
        category: "Design",
        isRecommended: false,
        price: "$79.99"
      },
      {
        title: "Photoshop for Web Design Beginners",
        description: "Learn Adobe Photoshop from scratch for web design, UI design and photo editing",
        imageUrl: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "15 hours",
        rating: 44,
        category: "Design",
        isRecommended: false,
        price: "$69.99"
      },
      {
        title: "UI/UX Design Bootcamp",
        description: "Learn User Interface Design and User Experience Design from scratch. Adobe XD, Figma, mobile and web design",
        imageUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "25 hours",
        rating: 45,
        category: "Design",
        isRecommended: true,
        price: "$89.99"
      },
      
      // Business & Marketing
      {
        title: "Complete Digital Marketing Course",
        description: "Master digital marketing strategy, social media marketing, SEO, YouTube, email, Facebook marketing, analytics & more!",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "23 hours",
        rating: 44,
        category: "Marketing",
        isRecommended: false,
        price: "$89.99"
      },
      {
        title: "SEO Training Course by Moz",
        description: "The Beginner's Guide to SEO has been read over 10 million times. Learn SEO from industry experts",
        imageUrl: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "12 hours",
        rating: 43,
        category: "Marketing",
        isRecommended: false,
        price: "$59.99"
      },
      {
        title: "Google Ads (AdWords) Certification Course",
        description: "Become Google Ads Certified! Learn to create, manage and optimize Google Ads campaigns like a pro",
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "18 hours",
        rating: 44,
        category: "Marketing",
        isRecommended: false,
        price: "$79.99"
      },
      
      // Languages
      {
        title: "Spanish for Beginners: Learn 500 Most Common Words",
        description: "Learn Spanish vocabulary, pronunciation and grammar. Speak Spanish with confidence!",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "8 hours",
        rating: 42,
        category: "Languages",
        isRecommended: false,
        price: "$49.99"
      },
      {
        title: "French Complete Course: Learn French for Beginners",
        description: "Complete French course: Learn to speak French like a native! Grammar, vocabulary, pronunciation & conversation",
        imageUrl: "https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "12 hours",
        rating: 43,
        category: "Languages",
        isRecommended: false,
        price: "$59.99"
      },
      {
        title: "Mandarin Chinese Complete Course",
        description: "Learn Mandarin Chinese from scratch. Pronunciation, characters, grammar, and conversation practice",
        imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "20 hours",
        rating: 44,
        category: "Languages",
        isRecommended: false,
        price: "$69.99"
      },
      
      // PEARL and Perl related courses
      {
        title: "Perl Programming for Beginners",
        description: "Learn Perl programming language from scratch. Master regular expressions, file handling, and scripting",
        imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "15 hours",
        rating: 41,
        category: "Programming",
        isRecommended: false,
        price: "$59.99"
      },
      {
        title: "Advanced Perl Programming",
        description: "Master advanced Perl concepts including OOP, modules, references, and complex data structures",
        imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "25 hours",
        rating: 42,
        category: "Programming",
        isRecommended: false,
        price: "$79.99"
      },
      {
        title: "Perl for System Administration",
        description: "Use Perl for system administration, automation, and scripting in Unix/Linux environments",
        imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "18 hours",
        rating: 40,
        category: "System Administration",
        isRecommended: false,
        price: "$69.99"
      },
      
      // More diverse courses
      {
        title: "Ruby on Rails Web Development",
        description: "Learn Ruby on Rails from scratch and build web applications with MVC architecture",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "30 hours",
        rating: 44,
        category: "Web Development",
        isRecommended: false,
        price: "$89.99"
      },
      {
        title: "PHP for Beginners - Complete PHP Course",
        description: "Learn PHP from scratch and build dynamic websites. Includes MySQL database integration",
        imageUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=400&h=250&fit=crop",
        difficulty: "Beginner",
        duration: "28 hours",
        rating: 43,
        category: "Web Development",
        isRecommended: false,
        price: "$79.99"
      },
      {
        title: "Complete Ethical Hacking Bootcamp",
        description: "Learn ethical hacking from scratch! Bug bounty hunting, penetration testing, web app security & more",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop",
        difficulty: "Advanced",
        duration: "15 hours",
        rating: 45,
        category: "Cybersecurity",
        isRecommended: false,
        price: "$199.99"
      },
      {
        title: "Blockchain and Cryptocurrency Complete Course",
        description: "Learn blockchain technology, cryptocurrency, Bitcoin, Ethereum, and smart contracts development",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
        difficulty: "Intermediate",
        duration: "35 hours",
        rating: 44,
        category: "Blockchain",
        isRecommended: false,
        price: "$149.99"
      }
    ];

    await db.insert(courses).values(comprehensiveCourses);
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data
initializeSampleData().catch(console.error);