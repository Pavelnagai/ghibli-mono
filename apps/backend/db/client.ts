import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/images.js';

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const connectionString = process.env.DB_URL!;
declare global {
  // eslint-disable-next-line no-var
  var dbInstance: PostgresJsDatabase<typeof schema>;
}

let dbInstance: PostgresJsDatabase<typeof schema>;
const client = postgres(connectionString, {
  prepare: false,
});

if (process.env.NODE_ENV === 'production') {
  dbInstance = drizzle(client, { schema });
} else {
  if (global.dbInstance === undefined) {
    global.dbInstance = drizzle(client, {
      schema,
    });
  }

  dbInstance = global.dbInstance;
}

export const disconnect = () => client.end();

export default dbInstance;
