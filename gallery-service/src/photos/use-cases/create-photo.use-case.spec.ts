import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreatePhotoUseCase } from './create-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { StorageRepository } from '../../storage/repositories/storage.repository';
import { GetAlbumUseCase } from '../../albums/use-cases/get-album.use-case';
import { mockPhoto } from '../../../test/fixtures/photo.fixture';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('CreatePhotoUseCase', () => {
  let useCase: CreatePhotoUseCase;
  let photosRepository: jest.Mocked<PhotosRepository>;
  let storageRepository: jest.Mocked<StorageRepository>;
  let getAlbumUseCase: jest.Mocked<GetAlbumUseCase>;

  const mockPhotosRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockStorageRepository = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  const mockGetAlbumUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePhotoUseCase,
        {
          provide: PhotosRepository,
          useValue: mockPhotosRepository,
        },
        {
          provide: StorageRepository,
          useValue: mockStorageRepository,
        },
        {
          provide: GetAlbumUseCase,
          useValue: mockGetAlbumUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CreatePhotoUseCase>(CreatePhotoUseCase);
    photosRepository = module.get(PhotosRepository);
    storageRepository = module.get(StorageRepository);
    getAlbumUseCase = module.get(GetAlbumUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a photo', async () => {
    const albumId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '123e4567-e89b-12d3-a456-426614174010';
    const createPhotoDto = {
      title: 'Test Photo',
      description: 'Test Description',
    };

    const mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    getAlbumUseCase.execute.mockResolvedValue(mockAlbum);
    storageRepository.uploadFile.mockResolvedValue({
      filename: 'uploaded-file.jpg',
      url: 'https://example.com/file.jpg',
      key: 'photos/uploaded-file.jpg',
    });
    photosRepository.create.mockResolvedValue(mockPhoto);

    const result = await useCase.execute(
      albumId,
      userId,
      createPhotoDto,
      mockFile,
    );

    expect(getAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
    expect(storageRepository.uploadFile).toHaveBeenCalled();
    expect(photosRepository.create).toHaveBeenCalled();
    expect(result).toEqual({ ...mockPhoto, url: 'https://example.com/file.jpg' });
  });

  it('should throw BadRequestException for invalid file type', async () => {
    const albumId = 'album-123';
    const userId = 'user-123';
    const createPhotoDto = {
      title: 'Test Photo',
    };

    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    getAlbumUseCase.execute.mockResolvedValue(mockAlbum);

    await expect(
      useCase.execute(albumId, userId, createPhotoDto, mockFile),
    ).rejects.toThrow(BadRequestException);
  });
});
