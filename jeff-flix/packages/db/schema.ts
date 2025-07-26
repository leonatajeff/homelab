import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  watchHistory: many(watchHistory),
}));

// Main content table - covers movies, shows, podcasts, etc.
export const content = pgTable('content', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  contentType: varchar('content_type', { length: 20 }).notNull(), // 'movie', 'tv_show', 'podcast', 'documentary', etc.
  filePath: varchar('file_path', { length: 500 }).notNull(),
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
  duration: integer('duration'), // in seconds
  releaseYear: integer('release_year'),
  genre: varchar('genre', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Content relations  
export const contentRelations = relations(content, ({ many }) => ({
  watchHistory: many(watchHistory),
}));

// Watch history/progress
export const watchHistory = pgTable('watch_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  contentId: integer('content_id').references(() => content.id).notNull(),
  watchedAt: timestamp('watched_at').defaultNow().notNull(),
  progressSeconds: integer('progress_seconds').default(0).notNull(),
  completed: boolean('completed').default(false).notNull(),
});

// Watch history relations
export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [watchHistory.contentId],
    references: [content.id],
  }),
}));