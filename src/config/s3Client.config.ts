import { S3ClientConfig } from '@aws-sdk/client-s3';

const s3ClientConfig: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_IAM_ACCESS_KEY,
    secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_BUCKET_REGION,
};

export default s3ClientConfig;
