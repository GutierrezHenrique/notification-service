import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaAlbumsRepository } from './prisma-albums.repository';
import { createMockPrismaService } from '../../../test/mocks/prisma.mock';

describe('PrismaAlbumsRepository', () => {
  let repository: PrismaAlbumsRepository;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAlbumsRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<PrismaAlbumsRepository>(PrismaAlbumsRepository);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an album', async () => {
      const userId = 'user-123';
      const createAlbumDto = {
        title: 'Test Album',
        description: 'Test Description',
      };

      const prismaAlbum = {
        id: 'album-123',
        title: createAlbumDto.title,
        description: createAlbumDto.description,
        userId,
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.album.create.mockResolvedValue(prismaAlbum as any);

      const result = await repository.create(userId, createAlbumDto);

      expect(prismaService.album.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Object);
      expect(result.title).toBe(createAlbumDto.title);
    });
  });

  describe('findAll', () => {
    it('should return all albums for a user', async () => {
      const userId = 'user-123';
      const prismaAlbums = [
        {
          id: 'album-123',
          title: 'Test Album',
          description: 'Test Description',
          userId,
          photos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.album.findMany.mockResolvedValue(prismaAlbums as any);

      const result = await repository.findAll(userId);

      expect(prismaService.album.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { photos: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an album by id', async () => {
      const albumId = 'album-123';
      const prismaAlbum = {
        id: albumId,
        title: 'Test Album',
        description: 'Test Description',
        userId: 'user-123',
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.album.findUnique.mockResolvedValue(prismaAlbum as any);

      const result = await repository.findOne(albumId);

      expect(prismaService.album.findUnique).toHaveBeenCalledWith({
        where: { id: albumId },
        include: { photos: true },
      });
      expect(result).toBeInstanceOf(Object);
      expect(result?.id).toBe(albumId);
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const albumId = 'album-123';
      const updateAlbumDto = {
        title: 'Updated Title',
      };

      const updatedPrismaAlbum = {
        id: albumId,
        title: updateAlbumDto.title,
        description: 'Test Description',
        userId: 'user-123',
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.album.update.mockResolvedValue(updatedPrismaAlbum as any);

      const result = await repository.update(albumId, updateAlbumDto);

      expect(prismaService.album.update).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Object);
    });
  });

  describe('delete', () => {
    it('should delete an album', async () => {
      const albumId = 'album-123';

      prismaService.album.delete.mockResolvedValue({} as any);

      await repository.delete(albumId);

      expect(prismaService.album.delete).toHaveBeenCalledWith({
        where: { id: albumId },
      });
    });
  });
});
