import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetPhotoUseCase } from './get-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { mockPhoto } from '../../../test/fixtures/photo.fixture';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('GetPhotoUseCase', () => {
  let useCase: GetPhotoUseCase;
  let repository: jest.Mocked<PhotosRepository>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPhotoUseCase,
        {
          provide: PhotosRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPhotoUseCase>(GetPhotoUseCase);
    repository = module.get(PhotosRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a photo if found and user owns it', async () => {
    const photoId = 'photo-123';
    const userId = 'user-123';
    const photoWithAlbum = {
      ...mockPhoto,
      album: { ...mockAlbum, userId: 'user-123' },
    };

    repository.findOne.mockResolvedValue(photoWithAlbum as any);

    const result = await useCase.execute(photoId, userId);

    expect(repository.findOne).toHaveBeenCalledWith(photoId);
    expect(result).toEqual(photoWithAlbum);
  });

  it('should throw NotFoundException if photo not found', async () => {
    const photoId = 'nonexistent-id';
    const userId = 'user-123';

    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(photoId, userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if user does not own photo', async () => {
    const photoId = 'photo-123';
    const userId = 'user-123';
    const photoWithDifferentOwner = {
      ...mockPhoto,
      album: { ...mockAlbum, userId: 'other-user' },
    };

    repository.findOne.mockResolvedValue(photoWithDifferentOwner as any);

    await expect(useCase.execute(photoId, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
