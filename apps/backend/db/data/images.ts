import { eq, desc, sql } from 'drizzle-orm';
import { images } from '../schema/images.js';
import { uploadFile } from '../minio/client.js';
import { ImageStyle } from '../../types/styles.js';
import { nanoid } from 'nanoid';
import db from '../client.js';

const getFileExtension = (mimeType: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return extensions[mimeType] || 'jpg';
};

export type Image = {
  id: string;
  url: string;
  processedImageUrl: string;
};

export type CreateImageInput = {
  inputImage: File;
  outputImage: File;
  style: ImageStyle;
};

export async function createItem({ inputImage, outputImage, style }: CreateImageInput) {
  const inputImageBuffer = Buffer.from(await inputImage.arrayBuffer());
  const outputImageBuffer = Buffer.from(await outputImage.arrayBuffer());

  const inputImageUrl = await uploadFile(
    'images',
    `${nanoid()}.${getFileExtension(inputImage.type)}`,
    inputImageBuffer,
    inputImageBuffer.length,
    inputImage.type,
  );
  const outputImageUrl = await uploadFile(
    'images',
    `${nanoid()}.${getFileExtension(outputImage.type)}`,
    outputImageBuffer,
    outputImageBuffer.length,
    outputImage.type,
  );

  await db.insert(images).values({
    url: inputImageUrl,
    processedImageUrl: outputImageUrl,
    style,
  });
}

export const updateItem = async (id: string, outputImage: File, style: ImageStyle) => {
  const outputImageBuffer = Buffer.from(await outputImage.arrayBuffer());

  const outputImageUrl = await uploadFile(
    'images',
    `${nanoid()}.${getFileExtension(outputImage.type)}`,
    outputImageBuffer,
    outputImageBuffer.length,
    outputImage.type,
  );

  await db
    .update(images)
    .set({
      id: nanoid(8),
      processedImageUrl: outputImageUrl,
      style,
      updatedAt: new Date(),
    })
    .where(eq(images.id, id));
};

export async function getImage(id: string): Promise<Image | null> {
  const result = await db.query.images.findFirst({
    where: eq(images.id, id),
  });
  return result || null;
}

export async function getImages(
  page: number,
  limit: number,
): Promise<{
  images: Image[];
  pagination: { currentPage: number; totalItems: number; limit: number; totalPages: number };
}> {
  const offset = (page - 1) * limit;

  const items = await db
    .select()
    .from(images)
    .orderBy(desc(images.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(images);
  const totalItems = Number(count);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    images: items,
    pagination: {
      currentPage: page,
      totalItems,
      limit,
      totalPages,
    },
  };
}

export async function deleteImage(id: string): Promise<void> {
  const image = await getImage(id);

  if (!image) {
    throw new Error('Image not found');
  }

  await db.delete(images).where(eq(images.id, id));
}
