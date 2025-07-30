import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  blob,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Firebase UID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("student"), // student, mentor, admin
  skills: blob("skills", { mode: "json" }).default([]),
  credits: integer("credits").default(0),
  internshipHours: integer("internship_hours").default(0),
  certificates: integer("certificates").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
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