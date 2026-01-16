import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAlbumUseCase } from './update-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';
import { GetAlbumUseCase } from './get-album.use-case';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('UpdateAlbumUseCase', () => {
  let useCase: UpdateAlbumUseCase;
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
        UpdateAlbumUseCase,
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

    useCase = module.get<UpdateAlbumUseCase>(UpdateAlbumUseCase);
    albumsRepository = module.get(AlbumsRepository);
    getAlbumUseCase = module.get(GetAlbumUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update an album', async () => {
    const albumId = 'album-123';
    const userId = 'user-123';
    const updateAlbumDto = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    const updatedAlbum = { ...mockAlbum, ...updateAlbumDto };

    getAlbumUseCase.execute.mockResolvedValue(mockAlbum);
    albumsRepository.update.mockResolvedValue(updatedAlbum);

    const result = await useCase.execute(albumId, userId, updateAlbumDto);

    expect(getAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
    expect(albumsRepository.update).toHaveBeenCalledWith(
      albumId,
      updateAlbumDto,
    );
    expect(result).toEqual(updatedAlbum);
  });
});
