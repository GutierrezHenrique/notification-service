import { Test, TestingModule } from '@nestjs/testing';
import { ListAlbumsUseCase } from './list-albums.use-case';
import { AlbumsRepository } from '../repositories/albums.repository';
import { mockAlbums } from '../../../test/fixtures/album.fixture';

describe('ListAlbumsUseCase', () => {
  let useCase: ListAlbumsUseCase;
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
        ListAlbumsUseCase,
        {
          provide: AlbumsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListAlbumsUseCase>(ListAlbumsUseCase);
    repository = module.get(AlbumsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all albums for a user', async () => {
    const userId = 'user-123';

    repository.findAll.mockResolvedValue(mockAlbums);

    const result = await useCase.execute(userId);

    expect(repository.findAll).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockAlbums);
    expect(result).toHaveLength(2);
  });

  it('should return empty array if user has no albums', async () => {
    const userId = 'user-123';

    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(userId);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
