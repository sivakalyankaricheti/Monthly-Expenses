import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
  passwordHash: text('password_hash'),
  passwordSalt: text('password_salt'),
}, (table) => [uniqueIndex('users_email_unique').on(table.email)]);

export const sessions = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
}, (table) => [index('sessions_user_id_idx').on(table.userId), index('sessions_expires_at_idx').on(table.expiresAt)]);
