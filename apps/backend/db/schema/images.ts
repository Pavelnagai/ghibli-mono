import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { ImageStyle } from '../../types/styles.js';
import { nanoid } from 'nanoid';

export const images = pgTable('images', {
  id: text('id').default(nanoid()).primaryKey(),
  url: text('url').notNull(),
  processedImageUrl: text('processed_image_url').notNull(),
  style: text('style').$type<ImageStyle>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
