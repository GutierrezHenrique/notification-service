import { Test, TestingModule } from '@nestjs/testing';
import { AlbumsService } from './albums.service';
import { CreateAlbumUseCase } from './use-cases/create-album.use-case';
import { ListAlbumsUseCase } from './use-cases/list-albums.use-case';
import { GetAlbumUseCase } from './use-cases/get-album.use-case';
import { UpdateAlbumUseCase } from './use-cases/update-album.use-case';
import { DeleteAlbumUseCase } from './use-cases/delete-album.use-case';
import { ShareAlbumUseCase } from './use-cases/share-album.use-case';
import { GetSharedAlbumUseCase } from './use-cases/get-shared-album.use-case';
import { mockAlbum } from '../../test/fixtures/album.fixture';

describe('AlbumsService', () => {
  let service: AlbumsService;
  let createAlbumUseCase: jest.Mocked<CreateAlbumUseCase>;
  let listAlbumsUseCase: jest.Mocked<ListAlbumsUseCase>;
  let getAlbumUseCase: jest.Mocked<GetAlbumUseCase>;
  let updateAlbumUseCase: jest.Mocked<UpdateAlbumUseCase>;
  let deleteAlbumUseCase: jest.Mocked<DeleteAlbumUseCase>;

  const mockCreateAlbumUseCase = {
    execute: jest.fn(),
  };

  const mockListAlbumsUseCase = {
    execute: jest.fn(),
  };

  const mockGetAlbumUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateAlbumUseCase = {
    execute: jest.fn(),
  };

  const mockDeleteAlbumUseCase = {
    execute: jest.fn(),
  };

  const mockShareAlbumUseCase = {
    execute: jest.fn(),
  };

  const mockGetSharedAlbumUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        {
          provide: CreateAlbumUseCase,
          useValue: mockCreateAlbumUseCase,
        },
        {
          provide: ListAlbumsUseCase,
          useValue: mockListAlbumsUseCase,
        },
        {
          provide: GetAlbumUseCase,
          useValue: mockGetAlbumUseCase,
        },
        {
          provide: UpdateAlbumUseCase,
          useValue: mockUpdateAlbumUseCase,
        },
        {
          provide: DeleteAlbumUseCase,
          useValue: mockDeleteAlbumUseCase,
        },
        {
          provide: ShareAlbumUseCase,
          useValue: mockShareAlbumUseCase,
        },
        {
          provide: GetSharedAlbumUseCase,
          useValue: mockGetSharedAlbumUseCase,
        },
      ],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
    createAlbumUseCase = module.get(CreateAlbumUseCase);
    listAlbumsUseCase = module.get(ListAlbumsUseCase);
    getAlbumUseCase = module.get(GetAlbumUseCase);
    updateAlbumUseCase = module.get(UpdateAlbumUseCase);
    deleteAlbumUseCase = module.get(DeleteAlbumUseCase);
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

      createAlbumUseCase.execute.mockResolvedValue(mockAlbum);

      const result = await service.create(userId, createAlbumDto);

      expect(createAlbumUseCase.execute).toHaveBeenCalledWith(
        userId,
        createAlbumDto,
      );
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('findAll', () => {
    it('should return all albums', async () => {
      const userId = 'user-123';
      const albums = [mockAlbum];

      listAlbumsUseCase.execute.mockResolvedValue(albums);

      const result = await service.findAll(userId);

      expect(listAlbumsUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toEqual(albums);
    });
  });

  describe('findOne', () => {
    it('should return an album', async () => {
      const albumId = 'album-123';
      const userId = 'user-123';

      getAlbumUseCase.execute.mockResolvedValue(mockAlbum);

      const result = await service.findOne(albumId, userId);

      expect(getAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const albumId = 'album-123';
      const userId = 'user-123';
      const updateAlbumDto = {
        title: 'Updated Title',
      };

      const updatedAlbum = { ...mockAlbum, ...updateAlbumDto };
      updateAlbumUseCase.execute.mockResolvedValue(updatedAlbum);

      const result = await service.update(albumId, userId, updateAlbumDto);

      expect(updateAlbumUseCase.execute).toHaveBeenCalledWith(
        albumId,
        userId,
        updateAlbumDto,
      );
      expect(result).toEqual(updatedAlbum);
    });
  });

  describe('remove', () => {
    it('should delete an album', async () => {
      const albumId = 'album-123';
      const userId = 'user-123';

      deleteAlbumUseCase.execute.mockResolvedValue(undefined);

      await service.remove(albumId, userId);

      expect(deleteAlbumUseCase.execute).toHaveBeenCalledWith(albumId, userId);
    });
  });
});
