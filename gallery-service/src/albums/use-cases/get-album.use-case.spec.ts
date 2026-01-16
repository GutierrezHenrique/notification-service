import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAlbumUseCase } from './get-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('GetAlbumUseCase', () => {
  let useCase: GetAlbumUseCase;
  let repository: jest.Mocked<AlbumsRepository>;

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
        GetAlbumUseCase,
        {
          provide: AlbumsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAlbumUseCase>(GetAlbumUseCase);
    repository = module.get(AlbumsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an album if found and user owns it', async () => {
    const albumId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '123e4567-e89b-12d3-a456-426614174010';

    repository.findOne.mockResolvedValue(mockAlbum);

    const result = await useCase.execute(albumId, userId);

    expect(repository.findOne).toHaveBeenCalledWith(albumId);
    expect(result).toEqual(mockAlbum);
  });

  it('should throw NotFoundException if album not found', async () => {
    const albumId = '123e4567-e89b-12d3-a456-426614174099';
    const userId = '123e4567-e89b-12d3-a456-426614174010';

    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(albumId, userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if user does not own album', async () => {
    const albumId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '123e4567-e89b-12d3-a456-426614174010';
    const differentUserId = '123e4567-e89b-12d3-a456-426614174011';
    const differentUserAlbum = { ...mockAlbum, userId: differentUserId };

    repository.findOne.mockResolvedValue(differentUserAlbum);

    // Test actual forbidden case
    await expect(useCase.execute(albumId, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
