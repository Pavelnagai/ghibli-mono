import { Hono } from 'hono';
import { getImage, getImages, createItem, deleteImage, updateItem } from '../../db/data/images';
import { generateImage } from 'services';
import { ImageStyle } from '@ghibli/types';

const imagesRouter = new Hono();

const fetchImageAsFile = async (url: string): Promise<File> => {
  const response = await fetch(`${process.env.MINIO_URL}${url}`);
  const blob = await response.blob();
  return new File([blob], 'image.png', { type: 'image/png' });
};

imagesRouter.get('/', async (c) => {
  try {
    const page = c.req.query('page') || 1;
    const limit = c.req.query('limit') || 10;
    const { images, pagination } = await getImages(Number(page), Number(limit));
    return c.json({ images, pagination });
  } catch (error) {
    console.error('Error getting images:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get images',
      },
      500,
    );
  }
});

imagesRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const image = await getImage(id);

    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    return c.json(image);
  } catch (error) {
    console.error('Error getting image:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get image',
      },
      500,
    );
  }
});

imagesRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const inputImage = formData.get('file') as File;
    const style = formData.get('style') as ImageStyle;

    console.log(formData, 'formData');

    if (!inputImage) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!style || !Object.values(ImageStyle).includes(style as ImageStyle)) {
      return c.json({ error: 'Invalid or missing style' }, 400);
    }

    const { outputImage } = await generateImage(inputImage, style);

    await createItem({
      inputImage,
      outputImage,
      style,
    });

    return c.json({ result: 'Successfully generated image' }, 201);
  } catch (error) {
    console.error('Error creating image:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create image',
      },
      500,
    );
  }
});

imagesRouter.delete('/:id', async (c) => {
  try {
    await deleteImage(c.req.param('id'));
    return c.json({ message: 'Image deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Image not found') {
      return c.json({ error: 'Image not found' }, 404);
    } else {
      console.error('Error deleting image:', error);
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Failed to delete image',
        },
        500,
      );
    }
  }
});

imagesRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { style } = await c.req.json();

    if (!style || !Object.values(ImageStyle).includes(style as ImageStyle)) {
      return c.json({ error: 'Invalid or missing style' }, 400);
    }

    const image = await getImage(id);
    if (!image) {
      return c.json({ error: 'Image not found' }, 404);
    }

    const inputImage = await fetchImageAsFile(image.url);
    const { outputImage } = await generateImage(inputImage, style);

    await updateItem(id, outputImage, style);

    return c.json({ result: 'Successfully regenerated image' }, 200);
  } catch (error) {
    console.error('Error regenerating image:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to regenerate image',
      },
      500,
    );
  }
});

export { imagesRouter };
