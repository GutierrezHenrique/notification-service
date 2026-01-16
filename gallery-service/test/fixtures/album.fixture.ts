import { Album } from '../../src/domain/entities/album.entity';

// Valid UUIDs for testing
const VALID_UUID_ALBUM_1 = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_ALBUM_2 = '123e4567-e89b-12d3-a456-426614174001';
const VALID_UUID_USER_1 = '123e4567-e89b-12d3-a456-426614174010';

export const mockAlbum: Album = new Album({
  id: VALID_UUID_ALBUM_1,
  title: 'Test Album',
  description: 'Test Description',
  userId: VALID_UUID_USER_1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

export const mockAlbums: Album[] = [
  mockAlbum,
  new Album({
    id: VALID_UUID_ALBUM_2,
    title: 'Test Album 2',
    description: 'Test Description 2',
    userId: VALID_UUID_USER_1,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  }),
];
