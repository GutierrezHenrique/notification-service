import { Test, TestingModule } from '@nestjs/testing';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { StorageRepository } from '../storage/repositories/storage.repository';
import { mockPhoto } from '../../test/fixtures/photo.fixture';

describe('PhotosController', () => {
  let controller: PhotosController;
  let service: jest.Mocked<PhotosService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const mockStorageRepository = {
      getFileUrl: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotosController],
      providers: [
        {
          provide: PhotosService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('10485760'),
          },
        },
        {
          provide: StorageRepository,
          useValue: mockStorageRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PhotosController>(PhotosController);
    service = module.get(PhotosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a photo', async () => {
      const albumId = 'album-123';
      const createPhotoDto = {
        title: 'Test Photo',
      };
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      service.create.mockResolvedValue(mockPhoto);

      const req = { user: mockUser } as any;
      const result = await controller.create(
        req,
        albumId,
        createPhotoDto,
        file,
      );

      expect(service.create).toHaveBeenCalledWith(
        albumId,
        mockUser.id,
        createPhotoDto,
        file,
      );
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all photos for an album', async () => {
      const albumId = 'album-123';
      const photos = [mockPhoto];

      service.findAll.mockResolvedValue({
        photos,
        total: photos.length,
        page: 1,
        limit: 50,
      });

      const req = { user: mockUser } as any;
      const result = await controller.findAll(req, albumId);

      expect(service.findAll).toHaveBeenCalledWith(
        albumId,
        mockUser.id,
        'desc',
        1,
        50,
      );
      expect(result.photos).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a photo by id', async () => {
      const photoId = 'photo-123';

      service.findOne.mockResolvedValue(mockPhoto);

      const req = { user: mockUser } as any;
      const storageRepository = controller['storageRepository'] as any;
      storageRepository.getFileUrl = jest
        .fn()
        .mockResolvedValue('https://example.com/photo.jpg');

      const result = await controller.findOne(req, photoId);

      expect(service.findOne).toHaveBeenCalledWith(photoId, mockUser.id);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a photo', async () => {
      const photoId = 'photo-123';
      const updatePhotoDto = {
        title: 'Updated Title',
      };

      const updatedPhoto = { ...mockPhoto, ...updatePhotoDto };
      service.update.mockResolvedValue(updatedPhoto);

      const req = { user: mockUser } as any;
      const result = await controller.update(req, photoId, updatePhotoDto);

      expect(service.update).toHaveBeenCalledWith(
        photoId,
        mockUser.id,
        updatePhotoDto,
      );
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a photo', async () => {
      const photoId = 'photo-123';

      service.remove.mockResolvedValue(undefined);

      const req = { user: mockUser } as any;
      await controller.remove(req, photoId);

      expect(service.remove).toHaveBeenCalledWith(photoId, mockUser.id);
    });
  });
});
