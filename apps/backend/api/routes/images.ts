import { Hono } from 'hono';
import { getImages, createItem, deleteImage, getImage, updateItem } from '../../db/data/images.js';
import { generateImage } from '../../services/generate-image.js';
import { ImageStyle } from '../../types/styles.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const imagesRouter = new Hono();

const fetchImageAsFile = async (url: string): Promise<File> => {
  const response = await fetch(`${process.env.MINIO_URL}${url}`);
  const blob = await response.blob();
  return new File([blob], 'image.png', { type: 'image/png' });
};

const validateId = zValidator('param', z.object({ id: z.string() }));

imagesRouter.get('/', async (c) => {
  const page = c.req.query('page') || 1;
  const limit = c.req.query('limit') || 10;
  const result = await getImages(Number(page), Number(limit));
  if (!result) {
    return c.json({ error: 'Images not found' }, 404);
  }
  return c.json(result);
});

imagesRouter.get('/:id', validateId, async (c) => {
  const id = c.req.param('id');
  const item = await getImage(id).catch(() => {
    return c.json({ error: 'Image not found' }, 404);
  });

  return c.json(item);
});

imagesRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const inputImage = body['file'];
    const style = body['style'] as ImageStyle | undefined;

    if (!inputImage || !(inputImage instanceof File) || !style || typeof style !== 'string') {
      return c.json({ error: 'Missing file or style, or incorrect type' }, 400);
    }
    const { outputImage } = await generateImage(inputImage as File, style as ImageStyle); // Make sure generateImage is also robust and logs errors

    await createItem({
      inputImage: inputImage as File,
      outputImage,
      style: style as ImageStyle,
    });

    return c.json({ result: 'Successfully generated image' }, 201);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error Message: ${error.message}`);
    } else {
      console.error(`[${new Date().toISOString()}] Non-Error object thrown:`, error);
    }
  }
});

imagesRouter.delete('/:id', validateId, async (c) => {
  const id = c.req.param('id');
  await deleteImage(id).catch(() => {
    return c.json({ error: 'Image not found' }, 404);
  });
  return c.json({ message: 'Image deleted successfully' });
});

imagesRouter.put(
  '/:id',
  validateId,
  zValidator(
    'json',
    z.object({
      style: z.nativeEnum(ImageStyle),
    }),
  ),
  async (c) => {
    const id = await c.req.param('id');
    const { style } = await c.req.json();
    const image = await getImage(id);

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    const inputImage = await fetchImageAsFile(image.url);
    const { outputImage } = await generateImage(inputImage, style);

    await updateItem(id, outputImage, style).catch(() => {
      return c.json({ error: 'Failed to regenerate image' }, 500);
    });

    return c.json({ result: 'Successfully regenerated image' }, 200);
  },
);

export { imagesRouter };
