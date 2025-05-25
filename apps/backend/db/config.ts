import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

type EnvType = 'string' | 'number' | 'boolean' | 'array';

const string = (key: string) => ({
  key,
  type: 'string' as const,
});

const integer = (key: string) => ({
  key,
  type: 'number' as const,
});

const boolean = (key: string) => ({
  key,
  type: 'boolean' as const,
});

const array = (key: string) => ({
  key,
  type: 'array' as const,
});

const parseEnvValue = <T extends EnvType>(
  rawValue: string | undefined,
  key: string,
  type: T,
):
  | (T extends 'string'
      ? string
      : T extends 'number'
        ? number
        : T extends 'boolean'
          ? boolean
          : T extends 'array'
            ? string[]
            : never)
  | undefined => {
  if (rawValue === undefined) {
    return undefined;
  }

  try {
    switch (type) {
      case 'string': {
        return rawValue as any;
      }
      case 'number': {
        const num = parseInt(rawValue, 10);
        return isNaN(num) ? undefined : (num as any);
      }
      case 'boolean': {
        const lower = rawValue.toLowerCase();
        if (lower === 'true') return true as any;
        if (lower === '1') return true as any;
        if (lower === 'false') return false as any;
        if (lower === '0') return false as any;
        console.warn(
          `Invalid boolean format for env var "${key}": "${rawValue}". Using undefined.`,
        );
        return undefined;
      }
      case 'array': {
        return rawValue
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0) as any;
      }
      default: {
        return undefined;
      }
    }
  } catch (error) {
    console.error(`Error parsing env var "${key}":`, error);
    return undefined;
  }
};

interface EnvTypeInfo<T extends EnvType> {
  key: string;
  type: T;
}

function getEnv<T extends EnvType>(
  typeInfo: EnvTypeInfo<T>,
): {
  default: (
    defaultValue: T extends 'string'
      ? string
      : T extends 'number'
        ? number
        : T extends 'boolean'
          ? boolean
          : T extends 'array'
            ? string[]
            : never,
  ) => T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : T extends 'array'
          ? string[]
          : never;
  required: (
    errorMessage?: string,
  ) => T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : T extends 'array'
          ? string[]
          : never;
} {
  const { key, type } = typeInfo;
  const rawValue = process.env[key];

  return {
    default: (defaultValue) => {
      const parsed = parseEnvValue(rawValue, key, type);
      return (parsed !== undefined ? parsed : defaultValue) as any;
    },
    required: (errorMessage) => {
      const parsed = parseEnvValue(rawValue, key, type);
      if (parsed === undefined) {
        throw new Error(errorMessage ?? `Missing or invalid required environment variable: ${key}`);
      }
      return parsed as any;
    },
  };
}

export const config = {
  api: {
    openAiUrl: getEnv(string('OPENAI_API_URL')).default('https://api.openai.com/v1'),
    openAiKey: getEnv(string('OPENAI_API_KEY')).required(),
  },

  app: {
    apiUrl: getEnv(string('API_URL')).default('http://localhost:8080'),
    frontendBaseUrl: getEnv(string('FRONTEND_BASE_URL')).default('http://localhost:5173'),
    port: getEnv(integer('PORT')).default(8080),
    env: getEnv(string('NODE_ENV')).default('development'),
    debug: getEnv(boolean('DEBUG')).default(true),
  },

  minio: {
    url: getEnv(string('MINIO_URL')).default('http://localhost:9000/'),
    storageUrl: getEnv(string('STORAGE_URL')).default('http://localhost:9000/'),
    endPoint: getEnv(string('MINIO_ENDPOINT')).required(),
    port: getEnv(integer('MINIO_PORT')).default(9000),
    consolePort: getEnv(integer('MINIO_CONSOLE_PORT')).default(9001),
    useSSL: getEnv(boolean('MINIO_USE_SSL')).default(false),
    accessKey: getEnv(string('MINIO_ACCESS_KEY')).required(),
    secretKey: getEnv(string('MINIO_SECRET_KEY')).required(),
    buckets: getEnv(array('MINIO_BUCKETS')).required(),
  },

  postgres: {
    host: getEnv(string('POSTGRES_HOST')).default('localhost'),
    port: getEnv(integer('POSTGRES_PORT')).default(5432),
    user: getEnv(string('POSTGRES_USER')).default('postgres'),
    password: getEnv(string('POSTGRES_PASSWORD')).default('postgres'),
    database: getEnv(string('POSTGRES_DB')).default('ghibli'),
    databaseUrl: getEnv(string('DB_URL')).required(),
    migrationsFolder: getEnv(string('MIGRATIONS_FOLDER')).default('../migrations'),
  },
};
