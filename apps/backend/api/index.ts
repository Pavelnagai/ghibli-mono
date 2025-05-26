import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { checkConnection as checkMinioConnection } from '../db/minio/client.js';
import { HTTPException } from 'hono/http-exception';
import { config } from '../db/config.js';
import { serve } from '@hono/node-server';
import { imagesRouter } from './routes/images.js';

const app = new Hono();

const initialize = async () => {
  try {
    await checkMinioConnection();
    console.log('MinIO connection established');
  } catch (error) {
    console.error('Failed to connect to MinIO:', error);
  }
};

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (
        origin === 'http://localhost:5173' ||
        origin === 'https://stylish-images.ru' ||
        origin === 'https://ghible.netlify.app' ||
        origin.endsWith('.stylish-images.ru') ||
        origin.includes('.telegram.org') ||
        origin.includes('.t.me')
      ) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept', 'Origin'],
    maxAge: 86400,
  }),
);

app.get('/', (c) => {
  return c.text('Hello, i am alive!');
});

app.route('/api/images', imagesRouter);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const status = err.status;
    const message = err.message || 'Server Error';
    const cause = (err as any).cause;

    if (status === 400 && cause) {
      return c.json({ message, errors: cause }, status);
    }

    return c.json({ message }, status);
  }

  return c.json({ message: 'Internal Server Error', error: err }, 500);
});

initialize();

serve({
  fetch: app.fetch,
  port: config.app.port,
});
