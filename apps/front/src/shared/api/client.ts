import { hc } from 'hono/client';

export const client = hc<any>(
  import.meta.env.VITE_API_URL + '/api' || 'http://localhost:8080/api',
  {
    headers: {
      Accept: 'application/json',
    },
  },
);
