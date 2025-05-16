import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { ImageStyle } from '@ghibli/types';

export const images = pgTable('images', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  processedImageUrl: text('processed_image_url').notNull(),
  style: text('style').$type<ImageStyle>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
