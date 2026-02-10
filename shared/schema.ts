import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = {
  ADMIN: "admin",
  USER: "user",
  STUDENT: "student",
  MENTOR: "mentor",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("user"), // admin, user, student, mentor
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  skills: blob("skills", { mode: "json" }).default([]),
  credits: integer("credits").default(0),
  internshipHours: integer("internship_hours").default(0),
  certificates: integer("certificates").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// System Settings for Admin
export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"), // general, notifications, security
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedBy: text("updated_by").references(() => users.id),
});

// System Alerts
export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  type: text("type").notNull(), // info, warning, error, success
  severity: text("severity").notNull().default("low"), // low, medium, high, critical
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  isResolved: integer("is_resolved", { mode: "boolean" }).default(false),
  resolvedBy: text("resolved_by").references(() => users.id),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// System Logs for Admin
export const systemLogs = sqliteTable("system_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, create, update, delete
  resource: text("resource").notNull(), // user, course, resume, etc.
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// Content/Resources for Admin management
export const resources = sqliteTable("resources", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // course, article, video, template
  url: text("url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const courses = sqliteTable("courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  duration: text("duration").notNull(),
  rating: integer("rating").default(0),
  category: text("category").notNull(),
  isRecommended: integer("is_recommended", { mode: "boolean" }).default(false),
  price: text("price").default("Free"),
});

export const userCourses = sqliteTable("user_courses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  progress: integer("progress").default(0),
  completed: integer("completed", { mode: "boolean" }).default(false),
  enrolledAt: integer("enrolled_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  isAI: integer("is_ai", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const skillProgress = sqliteTable("skill_progress", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  skillName: text("skill_name").notNull(),
  progress: integer("progress").default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const activities = sqliteTable("activities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // course_completed, certificate_earned, chat_session
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const interviewSessions = sqliteTable("interview_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // technical, behavioral, case_study
  feedback: text("feedback"),
  score: integer("score"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertSkillProgressSchema = createInsertSchema(skillProgress).omit(
  {
    id: true,
    updatedAt: true,
  }
);

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSessionSchema = createInsertSchema(
  interviewSessions
).omit({
  id: true,
  createdAt: true,
});

// Admin schemas
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type SkillProgress = typeof skillProgress.$inferSelect;
export type InsertSkillProgress = z.infer<typeof insertSkillProgressSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = z.infer<
  typeof insertInterviewSessionSchema
>;

// Admin types
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;