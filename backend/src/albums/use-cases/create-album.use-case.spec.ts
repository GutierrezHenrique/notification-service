import { Test, TestingModule } from '@nestjs/testing';
import { CreateAlbumUseCase } from './create-album.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';
import { mockAlbum } from '../../../test/fixtures/album.fixture';

describe('CreateAlbumUseCase', () => {
  let useCase: CreateAlbumUseCase;
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
        CreateAlbumUseCase,
        {
          provide: AlbumsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateAlbumUseCase>(CreateAlbumUseCase);
    repository = module.get(AlbumsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an album', async () => {
    const userId = 'user-123';
    const createAlbumDto = {
      title: 'Test Album',
      description: 'Test Description',
    };

    repository.create.mockResolvedValue(mockAlbum);

    const result = await useCase.execute(userId, createAlbumDto);

    expect(repository.create).toHaveBeenCalledWith(userId, createAlbumDto);
    expect(result).toEqual(mockAlbum);
  });
});
