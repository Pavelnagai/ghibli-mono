import { config } from 'db/config';
import { Client } from 'minio';

const minioConfig = {
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
};

export const minioClient = new Client(minioConfig) as Client;

export const BUCKETS = config.minio.buckets;
export type BucketType = (typeof BUCKETS)[number];

const MAX_RETRIES = 5;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createBucketPolicy = (bucketName: string) => ({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: '*' },
      Action: ['s3:GetBucketLocation', 's3:ListBucket'],
      Resource: `arn:aws:s3:::${bucketName}`,
    },
    {
      Effect: 'Allow',
      Principal: { AWS: '*' },
      Action: ['s3:PutObject', 's3:GetObject'],
      Resource: [
        `arn:aws:s3:::${bucketName}/*.mp4`,
        `arn:aws:s3:::${bucketName}/*.avi`,
        `arn:aws:s3:::${bucketName}/*.mov`,
        `arn:aws:s3:::${bucketName}/*.mkv`,
        `arn:aws:s3:::${bucketName}/*.html`,
        `arn:aws:s3:::${bucketName}/*.mp3`,
        `arn:aws:s3:::${bucketName}/*.wav`,
        `arn:aws:s3:::${bucketName}/*.ogg`,
        `arn:aws:s3:::${bucketName}/*.jpg`,
        `arn:aws:s3:::${bucketName}/*.jpeg`,
        `arn:aws:s3:::${bucketName}/*.png`,
        `arn:aws:s3:::${bucketName}/*.gif`,
      ],
    },
    {
      Effect: 'Allow',
      Principal: { AWS: '*' },
      Action: ['s3:DeleteObject'],
      Resource: `arn:aws:s3:::${bucketName}/*`,
    },
  ],
});

const ensureBucketPolicy = async (bucketName: string) => {
  const policyJSON = JSON.stringify(createBucketPolicy(bucketName));
  await minioClient.setBucketPolicy(bucketName, policyJSON);
  console.log(`Bucket policy set successfully for ${bucketName}.`);
};

const ensureSingleBucketExists = async (bucketName: string, retries: number = 0) => {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);

    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, '');
      console.log(`Bucket ${bucketName} created successfully.`);

      await ensureBucketPolicy(bucketName);
    } else {
      console.log(`Bucket ${bucketName} already exists.`);

      try {
        const currentPolicy = await minioClient.getBucketPolicy(bucketName);
        console.log(`Current bucket policy: ${currentPolicy}`);
      } catch (error: any) {
        if (error.code === 'NoSuchBucketPolicy') {
          console.log(`Bucket policy does not exist. Setting new policy.`);
          await ensureBucketPolicy(bucketName);
        } else {
          console.error(`Error getting bucket policy: ${error}`);
        }
      }
    }
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket exists: ${error}`);

    if (retries < MAX_RETRIES) {
      console.log(`Retrying in 5 seconds... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      await delay(5000); // Wait for 5 seconds before retrying
      return ensureSingleBucketExists(bucketName, retries + 1); // Retry
    } else {
      console.error(`Failed to ensure bucket exists after ${MAX_RETRIES} attempts.`);
      return false;
    }
  }
};

export const ensureBucketExists = async () => {
  const typeBucketResults = await Promise.all(
    BUCKETS.map((bucketType) => ensureSingleBucketExists(bucketType)),
  );

  if (typeBucketResults.includes(false)) {
    console.error('Failed to ensure all required buckets exist.');
    process.exit(1);
  }
};

interface FileResult {
  stream: NodeJS.ReadableStream;
  size: number;
  contentType: string;
  metadata: Record<string, string>;
}

export const getFile = async (bucketName: string, fileName: string): Promise<FileResult> => {
  if (!bucketName || !fileName) {
    throw new Error('Bucket name and file name are required');
  }

  try {
    const [stream, stat] = await Promise.all([
      minioClient.getObject(bucketName, fileName),
      minioClient.statObject(bucketName, fileName),
    ]);

    return {
      stream,
      size: stat.size,
      contentType: stat.metaData['content-type'] || 'application/octet-stream',
      metadata: stat.metaData,
    };
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
};

export const uploadFile = async (
  bucketType: BucketType,
  fileName: string,
  fileBuffer: Buffer,
  size: number,
  contentType: string,
): Promise<string> => {
  try {
    await minioClient.putObject(bucketType, fileName, fileBuffer, size, {
      'Content-Type': contentType,
    });

    const fileUrl = `/${bucketType}/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucketType}:`, error);
    throw error;
  }
};

export const checkConnection = async () => {
  try {
    await ensureBucketExists();
    return true;
  } catch (error) {
    console.error('Error checking MinIO connection:', error);
    return false;
  }
};
