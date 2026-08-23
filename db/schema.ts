import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackerState = sqliteTable('tracker_state', {
  userId: text('user_id').primaryKey(),
  data: text('data').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const users = sqliteTable('users', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  lastSeenAt: text('last_seen_at').notNull(),
});
