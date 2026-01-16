import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { StorageRepository } from '../storage/repositories/storage.repository';
import { mockAlbum } from '../../test/fixtures/album.fixture';

describe('AlbumsController', () => {
  let controller: AlbumsController;
  let service: jest.Mocked<AlbumsService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    share: jest.fn(),
    getShared: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174010',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const mockStorageRepository = {
      getFileUrl: jest.fn().mockResolvedValue('https://example.com/photo.jpg'),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [
        {
          provide: AlbumsService,
          useValue: mockService,
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

    controller = module.get<AlbumsController>(AlbumsController);
    service = module.get(AlbumsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an album', async () => {
      const createAlbumDto = {
        title: 'Test Album',
        description: 'Test Description',
      };

      service.create.mockResolvedValue(mockAlbum);

      const req = { user: mockUser } as any;
      const result = await controller.create(req, createAlbumDto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, createAlbumDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all albums for user', async () => {
      const albums = [mockAlbum];
      service.findAll.mockResolvedValue(albums);

      const req = { user: mockUser } as any;
      const result = await controller.findAll(req);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an album by id', async () => {
      service.findOne.mockResolvedValue(mockAlbum);

      const req = { user: mockUser } as any;
      const albumId = '123e4567-e89b-12d3-a456-426614174000';
      const result = await controller.findOne(req, albumId);

      expect(service.findOne).toHaveBeenCalledWith(albumId, mockUser.id);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const updateAlbumDto = {
        title: 'Updated Title',
      };

      const updatedAlbum = { ...mockAlbum, ...updateAlbumDto };
      service.update.mockResolvedValue(updatedAlbum);

      const albumId = '123e4567-e89b-12d3-a456-426614174000';
      const req = { user: mockUser } as any;
      const result = await controller.update(req, albumId, updateAlbumDto);

      expect(service.update).toHaveBeenCalledWith(
        albumId,
        mockUser.id,
        updateAlbumDto,
      );
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete an album', async () => {
      service.remove.mockResolvedValue(undefined);

      const albumId = '123e4567-e89b-12d3-a456-426614174000';
      const req = { user: mockUser } as any;
      await controller.remove(req, albumId);

      expect(service.remove).toHaveBeenCalledWith(albumId, mockUser.id);
    });
  });
});
