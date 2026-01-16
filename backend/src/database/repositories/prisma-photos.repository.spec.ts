import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaPhotosRepository } from './prisma-photos.repository';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('PrismaPhotosRepository', () => {
  let repository: PrismaPhotosRepository;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPhotosRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<PrismaPhotosRepository>(PrismaPhotosRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a photo', async () => {
      const albumId = 'album-123';
      const createPhotoData = {
        title: 'Test Photo',
        description: 'Test Description',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        acquisitionDate: new Date(),
        dominantColor: '#FF0000',
      };

      const prismaPhoto = {
        id: 'photo-123',
        ...createPhotoData,
        albumId,
        album: {
          id: albumId,
          title: 'Test Album',
          userId: 'user-123',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.photo.create.mockResolvedValue(prismaPhoto as any);

      const result = await repository.create(albumId, createPhotoData);

      expect(prismaService.photo.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('findAll', () => {
    it('should return all photos for an album', async () => {
      const albumId = 'album-123';
      const prismaPhotos = [
        {
          id: 'photo-123',
          title: 'Test Photo',
          filename: 'test.jpg',
          albumId,
          album: { id: albumId },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.photo.findMany.mockResolvedValue(prismaPhotos as any);
      prismaService.photo.count.mockResolvedValue(1);

      const result = await repository.findAll(albumId);

      expect(prismaService.photo.findMany).toHaveBeenCalled();
      expect(prismaService.photo.count).toHaveBeenCalled();
      expect(result.photos).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  describe('findOne', () => {
    it('should return a photo by id', async () => {
      const photoId = 'photo-123';
      const prismaPhoto = {
        id: photoId,
        title: 'Test Photo',
        albumId: 'album-123',
        album: { id: 'album-123' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.photo.findUnique.mockResolvedValue(prismaPhoto as any);

      const result = await repository.findOne(photoId);

      expect(prismaService.photo.findUnique).toHaveBeenCalledWith({
        where: { id: photoId },
        include: { album: true },
      });
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('update', () => {
    it('should update a photo', async () => {
      const photoId = 'photo-123';
      const updatePhotoDto = {
        title: 'Updated Title',
      };

      const updatedPrismaPhoto = {
        id: photoId,
        title: updatePhotoDto.title,
        albumId: 'album-123',
        album: { id: 'album-123' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.photo.update.mockResolvedValue(updatedPrismaPhoto as any);

      const result = await repository.update(photoId, updatePhotoDto);

      expect(prismaService.photo.update).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('delete', () => {
    it('should delete a photo', async () => {
      const photoId = 'photo-123';

      prismaService.photo.delete.mockResolvedValue({} as any);

      await repository.delete(photoId);

      expect(prismaService.photo.delete).toHaveBeenCalledWith({
        where: { id: photoId },
      });
    });
  });
});
