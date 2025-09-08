import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Citizens table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Citizen profiles with socio-economic data
export const citizenProfiles = pgTable("citizen_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: text("full_name").notNull(),
  aadhaarNumber: text("aadhaar_number"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"), // Male, Female, Other
  state: text("state").notNull(),
  district: text("district"),
  pincode: text("pincode"),
  annualIncome: integer("annual_income"),
  category: text("category"), // General, OBC, SC, ST
  occupation: text("occupation"),
  education: text("education"),
  familySize: integer("family_size"),
  hasDisability: boolean("has_disability").default(false),
  disabilityType: text("disability_type"),
  bankAccount: text("bank_account"),
  languagePreference: text("language_preference").default("en"),
  additionalDetails: jsonb("additional_details"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Government schemes
export const schemes = pgTable("schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Agriculture, Healthcare, Education, Housing, etc.
  ministry: text("ministry").notNull(),
  state: text("state"), // null for central schemes
  eligibilityCriteria: jsonb("eligibility_criteria").notNull(),
  benefits: text("benefits").notNull(),
  applicationProcess: text("application_process").notNull(),
  documents: jsonb("documents"), // required documents
  applicationUrl: text("application_url"),
  isActive: boolean("is_active").default(true),
  maxIncome: integer("max_income"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  targetCategories: jsonb("target_categories"), // array of categories
  targetOccupations: jsonb("target_occupations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheme applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  schemeId: varchar("scheme_id").notNull().references(() => schemes.id),
  applicationId: text("application_id"), // External application ID from government portal
  status: text("status").notNull().default("submitted"), // submitted, under_review, approved, rejected, disbursed
  appliedAt: timestamp("applied_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  documents: jsonb("documents"),
  statusHistory: jsonb("status_history"),
  amount: decimal("amount"),
  remarks: text("remarks"),
});

import { nanoid } from "nanoid";
// AI recommendations
export const recommendations = pgTable('recommendations', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id),
  schemeId: text('scheme_id').notNull().references(() => schemes.id),
  score: real('score').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  language: text("language").default("en"),
  startedAt: timestamp("started_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => chatConversations.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  contentType: text("content_type").default("text"), // text, voice
  timestamp: timestamp("timestamp").defaultNow(),
});

// Grievances
export const grievances = pgTable("grievances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => applications.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("open"), // open, in_progress, resolved, closed
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  preferredLanguage: true,
});

export const insertCitizenProfileSchema = z.object({
  // ... existing fields
  languagePreference: z.string().default('en'),
});

export const insertSchemeSchema = createInsertSchema(schemes).pick({
  name: true,
  description: true,
  category: true,
  ministry: true,
  state: true,
  eligibilityCriteria: true,
  benefits: true,
  applicationProcess: true,
  documents: true,
  applicationUrl: true,
  isActive: true,
  maxIncome: true,
  minAge: true,
  maxAge: true,
  targetCategories: true,
  targetOccupations: true,
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  userId: true,
  schemeId: true,
  applicationId: true,
  status: true,
  documents: true,
  amount: true,
  remarks: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  schemeId: true,
  score: true,
  reason: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).pick({
  userId: true,
  sessionId: true,
  language: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  conversationId: true,
  role: true,
  content: true,
  contentType: true,
});

export const insertGrievanceSchema = createInsertSchema(grievances).pick({
  userId: true,
  applicationId: true,
  title: true,
  description: true,
  category: true,
  priority: true,
  status: true,
  assignedTo: true,
  resolution: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCitizenProfile = z.infer<typeof insertCitizenProfileSchema>;
export type CitizenProfile = typeof citizenProfiles.$inferSelect;

export type InsertScheme = z.infer<typeof insertSchemeSchema>;
export type Scheme = typeof schemes.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type Grievance = typeof grievances.$inferSelect;
