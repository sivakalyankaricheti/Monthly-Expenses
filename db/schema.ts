import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trackerState = sqliteTable('tracker_state', {
  id: integer('id').primaryKey(),
  data: text('data').notNull(),
  updatedAt: text('updated_at').notNull(),
});
