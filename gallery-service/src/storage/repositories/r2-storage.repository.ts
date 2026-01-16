import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageRepository, UploadFileResult } from './storage.repository';
import { sanitizeFilePath } from '../../security/utils/sanitize.util';

@Injectable()
export class R2StorageRepository implements StorageRepository {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        'R2 configuration is missing. Please check your environment variables.',
      );
    }

    this.bucketName = bucketName;
    this.publicUrl =
      publicUrl ||
      `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'photos',
  ): Promise<UploadFileResult> {
    // Sanitize folder name to prevent path traversal
    folder = sanitizeFilePath(folder);

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = sanitizeFilePath(filename);
    const key = `${folder}/${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    // Generate presigned URL for the uploaded file
    const url = await this.getSignedUrl(key);

    return {
      filename,
      url,
      key,
    };
  }

  async deleteFile(key: string): Promise<void> {
    // Sanitize key to prevent path traversal
    key = sanitizeFilePath(key);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getFileUrl(key: string): Promise<string> {
    // Sanitize key to prevent path traversal
    key = sanitizeFilePath(key);
    return this.getSignedUrl(key);
  }

  private async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // Generate presigned URL valid for 1 hour (3600 seconds)
    // Max expiration is 7 days (604800 seconds) for R2
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: Math.min(expiresIn, 604800), // Max 7 days for R2
    });

    return signedUrl;
  }

  private getPublicUrl(key: string): string {
    if (this.publicUrl) {
      // Remove trailing slash if present to avoid double slashes
      const baseUrl = this.publicUrl.endsWith('/')
        ? this.publicUrl.slice(0, -1)
        : this.publicUrl;
      return `${baseUrl}/${key}`;
    }
    // Fallback para URL padrão do R2
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    return `https://${accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
  }
}
