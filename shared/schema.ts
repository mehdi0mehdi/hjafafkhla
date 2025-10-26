import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, uuid, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - synced with Supabase auth.users
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  is_admin: boolean("is_admin").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// Tools table - gaming tools and utilities
export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  short_desc: text("short_desc").notNull(),
  description_markdown: text("description_markdown").notNull(),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  donation_url: text("donation_url"),
  telegram_url: text("telegram_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Download buttons - multiple download options per tool
export const download_buttons = pgTable("download_buttons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  order: integer("order").notNull().default(0),
});

// Downloads tracking - authenticated user downloads
export const downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  button_label: text("button_label").notNull(),
  downloaded_at: timestamp("downloaded_at").notNull().defaultNow(),
});

// Reviews - user reviews for tools
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tool_id: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  review_text: text("review_text").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserTool: unique().on(table.user_id, table.tool_id),
}));

// Insert schemas with validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  short_desc: z.string().min(10, "Short description must be at least 10 characters"),
  description_markdown: z.string().min(20, "Description must be at least 20 characters"),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
});

export const insertDownloadButtonSchema = createInsertSchema(download_buttons).omit({
  id: true,
}).extend({
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Invalid URL"),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloaded_at: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  created_at: true,
}).extend({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  review_text: z.string().min(10, "Review must be at least 10 characters"),
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;

export type DownloadButton = typeof download_buttons.$inferSelect;
export type InsertDownloadButton = z.infer<typeof insertDownloadButtonSchema>;

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Extended types with relations
export type ToolWithButtons = Tool & {
  download_buttons: DownloadButton[];
  download_count?: number;
  average_rating?: number;
  review_count?: number;
};

export type ReviewWithUser = Review & {
  user: Pick<User, 'username'>;
};
