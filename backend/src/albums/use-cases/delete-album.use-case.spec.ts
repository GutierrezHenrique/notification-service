import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeleteAlbumUseCase } from './delete-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';
import { GetAlbumUseCase } from './get-album.use-case';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('DeleteAlbumUseCase', () => {
  let useCase: DeleteAlbumUseCase;
  let albumsRepository: jest.Mocked<AlbumsRepository>;
  let getAlbumUseCase: jest.Mocked<GetAlbumUseCase>;

  const mockAlbumsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockGetAlbumUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAlbumUseCase,
        {
          provide: AlbumsRepository,
          useValue: mockAlbumsRepository,
        },
        {
          provide: GetAlbumUseCase,
          useValue: mockGetAlbumUseCase,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAlbumUseCase>(DeleteAlbumUseCase);
    albumsRepository = module.get(AlbumsRepository);
    getAlbumUseCase = module.get(GetAlbumUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete an album without photos', async () => {
    const albumId = 'album-123';
    const userId = 'user-123';
    const albumWithoutPhotos = { ...mockAlbum, photos: [] };

    getAlbumUseCase.execute.mockResolvedValue(albumWithoutPhotos);
    albumsRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(albumId, userId);

    expect(getAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
    expect(albumsRepository.delete).toHaveBeenCalledWith(albumId);
  });

  it('should throw BadRequestException if album has photos', async () => {
    const albumId = 'album-123';
    const userId = 'user-123';
    const albumWithPhotos = {
      ...mockAlbum,
      photos: [{ id: 'photo-1' }],
    };

    getAlbumUseCase.execute.mockResolvedValue(albumWithPhotos as any);

    await expect(useCase.execute(albumId, userId)).rejects.toThrow(
      BadRequestException,
    );
    expect(albumsRepository.delete).not.toHaveBeenCalled();
  });
});
