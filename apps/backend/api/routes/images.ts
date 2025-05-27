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
  const image = await getImage(id).catch(() => {
    return c.json({ error: 'Image not found' }, 404);
  });

  return c.json(image);
});

// images.ts
imagesRouter.post('/', async (c) => {
  console.log(
    `[${new Date().toISOString()}] POST /api/images - Request received from ${c.req.header('X-Real-IP')}   ${c.req.header('X-Forwarded-For')}  'unknown IP'}]`,
  );
  try {
    c.header('Access-Control-Allow-Origin', '*'); // Temporary - replace with CORS middleware

    console.log(`[${new Date().toISOString()}] POST /api/images - Attempting to parse body...`);
    const body = await c.req.parseBody();
    console.log(
      `[${new Date().toISOString()}] POST /api/images - Body parsed. Keys: ${Object.keys(body).join(', ')}`,
    );

    const inputImage = body['file'];
    const style = body['style'] as ImageStyle | undefined;

    console.log(
      `[${new Date().toISOString()}] POST /api/images - Raw file from body: type=${typeof inputImage}, name=${inputImage ? (inputImage as File).name : 'No file provided'}, size=${inputImage ? (inputImage as File).size : 'N/A'}`,
    );
    console.log(
      `[${new Date().toISOString()}] POST /api/images - Raw style from body: type=${typeof style}, value=${style}`,
    );

    if (!inputImage || !(inputImage instanceof File) || !style || typeof style !== 'string') {
      console.error(
        `[${new Date().toISOString()}] POST /api/images - Validation failed: Missing or incorrect file/style type.`,
      );
      return c.json({ error: 'Missing file or style, or incorrect type' }, 400);
    }
    console.log(`[${new Date().toISOString()}] POST /api/images - File and style validated.`);

    console.log(
      `[${new Date().toISOString()}] POST /api/images - Calling generateImage with style: ${style}`,
    );
    const { outputImage } = await generateImage(inputImage as File, style as ImageStyle); // Make sure generateImage is also robust and logs errors
    console.log(`[${new Date().toISOString()}] POST /api/images - generateImage completed.`);

    console.log(`[${new Date().toISOString()}] POST /api/images - Calling createItem.`);
    await createItem({
      inputImage: inputImage as File,
      outputImage,
      style: style as ImageStyle,
    });
    console.log(`[${new Date().toISOString()}] POST /api/images - createItem completed.`);

    console.log(`[${new Date().toISOString()}] POST /api/images - Sending 201 response.`);
    return c.json({ result: 'Successfully generated image' }, 201);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] !!!!! FATAL ERROR in POST /api/images !!!!!`);
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error Message: ${error.message}`);
      console.error(`[${new Date().toISOString()}] Error Stack: ${error.stack}`);
    } else {
      console.error(`[${new Date().toISOString()}] Non-Error object thrown:`, error);
    }
    // DO NOT return c.json here if the process is about to crash.
    // The crash itself is what Nginx sees as "prematurely closed connection".
    // If Hono *can* recover and send a 500, that's better, but a crash is likely.
    // For now, focus on the logs above to see *where* it crashes.
    // If the crash happens before this catch, you won't see this log.
    // If it happens *after* this log but before Hono sends the response,
    // then the Hono process itself might be exiting.

    // Attempt to send a response if we reach here, but the main goal is to see the logs above.
    // if (!c.res.) {
    //   // Hono might not have this exact property, check Hono docs for checking if response sent
    //   return c.json(
    //     {
    //       error: error instanceof Error ? error.message : 'Internal server error after logging',
    //     },
    //     500,
    //   );
    // }
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
