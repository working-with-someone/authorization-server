import { S3Client } from '@aws-sdk/client-s3';
import s3ClientConfig from '../../config/s3Client.config';

const s3Client = new S3Client(s3ClientConfig);

export default s3Client;
