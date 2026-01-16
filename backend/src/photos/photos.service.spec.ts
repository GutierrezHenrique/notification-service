import { Test, TestingModule } from '@nestjs/testing';
import { PhotosService } from './photos.service';
import { CreatePhotoUseCase } from './use-cases/create-photo.use-case';
import { ListPhotosUseCase } from './use-cases/list-photos.use-case';
import { GetPhotoUseCase } from './use-cases/get-photo.use-case';
import { UpdatePhotoUseCase } from './use-cases/update-photo.use-case';
import { DeletePhotoUseCase } from './use-cases/delete-photo.use-case';
import { SearchPhotosUseCase } from './use-cases/search-photos.use-case';
import { mockPhoto } from '../../test/fixtures/photo.fixture';

describe('PhotosService', () => {
  let service: PhotosService;
  let createPhotoUseCase: jest.Mocked<CreatePhotoUseCase>;
  let listPhotosUseCase: jest.Mocked<ListPhotosUseCase>;
  let getPhotoUseCase: jest.Mocked<GetPhotoUseCase>;
  let updatePhotoUseCase: jest.Mocked<UpdatePhotoUseCase>;
  let deletePhotoUseCase: jest.Mocked<DeletePhotoUseCase>;

  const mockCreatePhotoUseCase = {
    execute: jest.fn(),
  };

  const mockListPhotosUseCase = {
    execute: jest.fn(),
  };

  const mockGetPhotoUseCase = {
    execute: jest.fn(),
  };

  const mockUpdatePhotoUseCase = {
    execute: jest.fn(),
  };

  const mockDeletePhotoUseCase = {
    execute: jest.fn(),
  };

  const mockSearchPhotosUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        {
          provide: CreatePhotoUseCase,
          useValue: mockCreatePhotoUseCase,
        },
        {
          provide: ListPhotosUseCase,
          useValue: mockListPhotosUseCase,
        },
        {
          provide: GetPhotoUseCase,
          useValue: mockGetPhotoUseCase,
        },
        {
          provide: UpdatePhotoUseCase,
          useValue: mockUpdatePhotoUseCase,
        },
        {
          provide: DeletePhotoUseCase,
          useValue: mockDeletePhotoUseCase,
        },
        {
          provide: SearchPhotosUseCase,
          useValue: mockSearchPhotosUseCase,
        },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
    createPhotoUseCase = module.get(CreatePhotoUseCase);
    listPhotosUseCase = module.get(ListPhotosUseCase);
    getPhotoUseCase = module.get(GetPhotoUseCase);
    updatePhotoUseCase = module.get(UpdatePhotoUseCase);
    deletePhotoUseCase = module.get(DeletePhotoUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a photo', async () => {
      const albumId = 'album-123';
      const userId = 'user-123';
      const createPhotoDto = {
        title: 'Test Photo',
      };
      const file = {} as Express.Multer.File;

      createPhotoUseCase.execute.mockResolvedValue(mockPhoto);

      const result = await service.create(
        albumId,
        userId,
        createPhotoDto,
        file,
      );

      expect(createPhotoUseCase.execute).toHaveBeenCalledWith(
        albumId,
        userId,
        createPhotoDto,
        file,
      );
      expect(result).toEqual(mockPhoto);
    });
  });

  describe('findAll', () => {
    it('should return all photos', async () => {
      const albumId = 'album-123';
      const userId = 'user-123';
      const photos = [mockPhoto];

      listPhotosUseCase.execute.mockResolvedValue({
        photos,
        total: photos.length,
        page: 1,
        limit: 50,
      });

      const result = await service.findAll(albumId, userId);

      expect(listPhotosUseCase.execute).toHaveBeenCalledWith(
        albumId,
        userId,
        'desc',
        1,
        50,
      );
      expect(result.photos).toEqual(photos);
      expect(result.total).toBe(photos.length);
    });
  });

  describe('findOne', () => {
    it('should return a photo', async () => {
      const photoId = 'photo-123';
      const userId = 'user-123';

      getPhotoUseCase.execute.mockResolvedValue(mockPhoto);

      const result = await service.findOne(photoId, userId);

      expect(getPhotoUseCase.execute).toHaveBeenCalledWith(photoId, userId);
      expect(result).toEqual(mockPhoto);
    });
  });

  describe('update', () => {
    it('should update a photo', async () => {
      const photoId = 'photo-123';
      const userId = 'user-123';
      const updatePhotoDto = {
        title: 'Updated Title',
      };

      const updatedPhoto = { ...mockPhoto, ...updatePhotoDto };
      updatePhotoUseCase.execute.mockResolvedValue(updatedPhoto);

      const result = await service.update(photoId, userId, updatePhotoDto);

      expect(updatePhotoUseCase.execute).toHaveBeenCalledWith(
        photoId,
        userId,
        updatePhotoDto,
      );
      expect(result).toEqual(updatedPhoto);
    });
  });

  describe('remove', () => {
    it('should delete a photo', async () => {
      const photoId = 'photo-123';
      const userId = 'user-123';

      deletePhotoUseCase.execute.mockResolvedValue(undefined);

      await service.remove(photoId, userId);

      expect(deletePhotoUseCase.execute).toHaveBeenCalledWith(photoId, userId);
    });
  });
});
