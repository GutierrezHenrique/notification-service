import { Test, TestingModule } from '@nestjs/testing';
import { ListPhotosUseCase } from './list-photos.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { GetAlbumUseCase } from '../../albums/use-cases/get-album.use-case';
import { mockPhotos } from '../../../test/fixtures/photo.fixture';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('ListPhotosUseCase', () => {
  let useCase: ListPhotosUseCase;
  let photosRepository: jest.Mocked<PhotosRepository>;
  let getAlbumUseCase: jest.Mocked<GetAlbumUseCase>;

  const mockPhotosRepository = {
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
        ListPhotosUseCase,
        {
          provide: PhotosRepository,
          useValue: mockPhotosRepository,
        },
        {
          provide: GetAlbumUseCase,
          useValue: mockGetAlbumUseCase,
        },
      ],
    }).compile();

    useCase = module.get<ListPhotosUseCase>(ListPhotosUseCase);
    photosRepository = module.get(PhotosRepository);
    getAlbumUseCase = module.get(GetAlbumUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all photos for an album', async () => {
    const albumId = '123e4567-e89b-12d3-a456-426614174000';
    const userId = '123e4567-e89b-12d3-a456-426614174010';

    getAlbumUseCase.execute.mockResolvedValue(mockAlbum);
    photosRepository.findAll.mockResolvedValue({
      photos: mockPhotos,
      total: mockPhotos.length,
      page: 1,
      limit: 50,
    });

    const result = await useCase.execute(albumId, userId);

    expect(getAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
    expect(photosRepository.findAll).toHaveBeenCalledWith(albumId, 'desc', 1, 50);
    expect(result.photos).toEqual(mockPhotos);
    expect(result.total).toBe(mockPhotos.length);
  });
});
