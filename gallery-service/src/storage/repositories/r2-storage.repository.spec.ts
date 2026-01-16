import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { R2StorageRepository } from './r2-storage.repository';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));

describe('R2StorageRepository', () => {
  let repository: R2StorageRepository;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      const config: { [key: string]: string } = {
        R2_ACCOUNT_ID: 'test-account-id',
        R2_ACCESS_KEY_ID: 'test-access-key',
        R2_SECRET_ACCESS_KEY: 'test-secret-key',
        R2_BUCKET_NAME: 'test-bucket',
        R2_PUBLIC_URL: 'https://example.com/r2',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        R2StorageRepository,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<R2StorageRepository>(R2StorageRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file to R2', async () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const s3Client = repository['s3Client'] as any;
      s3Client.send = jest.fn().mockResolvedValue({});
      (getSignedUrl as jest.Mock).mockResolvedValue('https://example.com/signed-url.jpg');

      const result = await repository.uploadFile(file, 'photos');

      expect(s3Client.send).toHaveBeenCalled();
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('key');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from R2', async () => {
      const key = 'photos/test-file.jpg';

      const s3Client = repository['s3Client'] as any;
      s3Client.send = jest.fn().mockResolvedValue({});

      await repository.deleteFile(key);

      expect(s3Client.send).toHaveBeenCalled();
    });
  });

  describe('getFileUrl', () => {
    it('should return presigned URL for a file', async () => {
      const key = 'photos/test-file.jpg';
      (getSignedUrl as jest.Mock).mockResolvedValue('https://example.com/signed-url.jpg');

      const url = await repository.getFileUrl(key);

      expect(getSignedUrl).toHaveBeenCalled();
      expect(url).toBe('https://example.com/signed-url.jpg');
    });
  });
});
