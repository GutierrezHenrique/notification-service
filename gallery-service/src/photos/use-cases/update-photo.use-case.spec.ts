import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePhotoUseCase } from './update-photo.use-case';
import { PhotosRepository } from '../repositories/photos.repository';
import { GetPhotoUseCase } from './get-photo.use-case';
import { mockPhoto } from '../../../test/fixtures/photo.fixture';

describe('UpdatePhotoUseCase', () => {
  let useCase: UpdatePhotoUseCase;
  let photosRepository: jest.Mocked<PhotosRepository>;
  let getPhotoUseCase: jest.Mocked<GetPhotoUseCase>;

  const mockPhotosRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockGetPhotoUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePhotoUseCase,
        {
          provide: PhotosRepository,
          useValue: mockPhotosRepository,
        },
        {
          provide: GetPhotoUseCase,
          useValue: mockGetPhotoUseCase,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePhotoUseCase>(UpdatePhotoUseCase);
    photosRepository = module.get(PhotosRepository);
    getPhotoUseCase = module.get(GetPhotoUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a photo', async () => {
    const photoId = 'photo-123';
    const userId = 'user-123';
    const updatePhotoDto = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    const updatedPhoto = { ...mockPhoto, ...updatePhotoDto };

    getPhotoUseCase.execute.mockResolvedValue(mockPhoto);
    photosRepository.update.mockResolvedValue(updatedPhoto);

    const result = await useCase.execute(photoId, userId, updatePhotoDto);

    expect(getPhotoUseCase.execute).toHaveBeenCalledWith(photoId, userId);
    expect(photosRepository.update).toHaveBeenCalledWith(
      photoId,
      updatePhotoDto,
    );
    expect(result).toEqual(updatedPhoto);
  });
});
