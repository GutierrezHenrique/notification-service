import { Photo } from '../../src/domain/entities/photo.entity';
import { Album } from '../../src/domain/entities/album.entity';

// Valid UUIDs for testing
const VALID_UUID_PHOTO_1 = '123e4567-e89b-12d3-a456-426614174020';
const VALID_UUID_PHOTO_2 = '123e4567-e89b-12d3-a456-426614174021';
const VALID_UUID_ALBUM_1 = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_USER_1 = '123e4567-e89b-12d3-a456-426614174010';

export const mockPhoto: Photo = new Photo({
  id: VALID_UUID_PHOTO_1,
  title: 'Test Photo',
  description: 'Test Description',
  filename: 'test-photo.jpg',
  originalName: 'test-photo.jpg',
  mimeType: 'image/jpeg',
  size: 1024000,
  acquisitionDate: new Date('2024-01-01'),
  dominantColor: '#FF0000',
  albumId: VALID_UUID_ALBUM_1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

export const mockPhotos: Photo[] = [
  mockPhoto,
  new Photo({
    id: VALID_UUID_PHOTO_2,
    title: 'Test Photo 2',
    description: 'Test Description 2',
    filename: 'test-photo-2.jpg',
    originalName: 'test-photo-2.jpg',
    mimeType: 'image/png',
    size: 2048000,
    acquisitionDate: new Date('2024-01-02'),
    dominantColor: '#00FF00',
    albumId: VALID_UUID_ALBUM_1,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  }),
];

export const mockAlbum = new Album({
  id: VALID_UUID_ALBUM_1,
  title: 'Test Album',
  description: 'Test Description',
  userId: VALID_UUID_USER_1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});
