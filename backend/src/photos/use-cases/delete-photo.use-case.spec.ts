import { Test, TestingModule } from '@nestjs/testing';
import { DeletePhotoUseCase } from './delete-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { StorageRepository } from '../../storage/repositories/storage.repository';
import { GetPhotoUseCase } from './get-photo.use-case';
import { mockPhoto } from '../../../test/fixtures/photo.fixture';

describe('DeletePhotoUseCase', () => {
  let useCase: DeletePhotoUseCase;
  let photosRepository: jest.Mocked<PhotosRepository>;
  let storageRepository: jest.Mocked<StorageRepository>;
  let getPhotoUseCase: jest.Mocked<GetPhotoUseCase>;

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

  const mockGetPhotoUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePhotoUseCase,
        {
          provide: PhotosRepository,
          useValue: mockPhotosRepository,
        },
        {
          provide: StorageRepository,
          useValue: mockStorageRepository,
        },
        {
          provide: GetPhotoUseCase,
          useValue: mockGetPhotoUseCase,
        },
      ],
    }).compile();

    useCase = module.get<DeletePhotoUseCase>(DeletePhotoUseCase);
    photosRepository = module.get(PhotosRepository);
    storageRepository = module.get(StorageRepository);
    getPhotoUseCase = module.get(GetPhotoUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a photo', async () => {
    const photoId = 'photo-123';
    const userId = 'user-123';

    getPhotoUseCase.execute.mockResolvedValue(mockPhoto);
    storageRepository.deleteFile.mockResolvedValue(undefined);
    photosRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(photoId, userId);

    expect(getPhotoUseCase.execute).toHaveBeenCalledWith(photoId, userId);
    expect(storageRepository.deleteFile).toHaveBeenCalledWith(
      'photos/test-photo.jpg',
    );
    expect(photosRepository.delete).toHaveBeenCalledWith(photoId);
  });

  it('should continue deletion even if storage deletion fails', async () => {
    const photoId = 'photo-123';
    const userId = 'user-123';

    getPhotoUseCase.execute.mockResolvedValue(mockPhoto);
    storageRepository.deleteFile.mockRejectedValue(new Error('Storage error'));
    photosRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(photoId, userId);

    expect(photosRepository.delete).toHaveBeenCalledWith(photoId);
  });
});
