import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep the users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Session table to track screenshot capture sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Untitled Session"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  captureInterval: integer("capture_interval").notNull().default(2),
  captureArea: text("capture_area").notNull().default("Full Browser Tab"),
  status: text("status").notNull().default("active"),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
  captureInterval: true,
  captureArea: true,
});

// Screenshot table to store captured screenshots
export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  imageData: text("image_data").notNull(), // Base64 encoded image
  description: text("description"),
  aiAnalysisStatus: text("ai_analysis_status").default("pending"),
});

export const insertScreenshotSchema = createInsertSchema(screenshots).pick({
  sessionId: true,
  imageData: true,
  description: true,
  aiAnalysisStatus: true,
});

// Agent configuration table
export const agentConfigs = pgTable("agent_configs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // analyzer, writer, reviewer, orchestrator
  systemPrompt: text("system_prompt").notNull(),
  isActive: integer("is_active").notNull().default(1),
});

export const insertAgentConfigSchema = createInsertSchema(agentConfigs).pick({
  type: true,
  systemPrompt: true,
  isActive: true,
});

// Documentation table
export const documentations = pgTable("documentations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  format: text("format").notNull().default("markdown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  detailLevel: text("detail_level").notNull().default("standard"),
});

export const insertDocumentationSchema = createInsertSchema(documentations).pick({
  sessionId: true,
  title: true,
  content: true,
  format: true,
  detailLevel: true,
});

// Define all the exported types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;

export type InsertAgentConfig = z.infer<typeof insertAgentConfigSchema>;
export type AgentConfig = typeof agentConfigs.$inferSelect;

export type InsertDocumentation = z.infer<typeof insertDocumentationSchema>;
export type Documentation = typeof documentations.$inferSelect;
