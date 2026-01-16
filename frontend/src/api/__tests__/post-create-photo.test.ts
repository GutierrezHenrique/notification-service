import { postCreatePhoto } from '../post/post-create-photo';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('postCreatePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create photo successfully', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const photoData = {
      title: 'New Photo',
      description: 'Description',
      acquisitionDate: '2024-01-01',
      file,
    };

    const mockPhoto = {
      id: '1',
      title: 'New Photo',
      filename: 'test.jpg',
      size: 1024,
      acquisitionDate: '2024-01-01',
      dominantColor: '#FF0000',
      createdAt: '2024-01-01',
    };

    mockedApi.post.mockResolvedValue({ data: mockPhoto });

    const result = await postCreatePhoto('album1', photoData);

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/albums/album1/photos',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    expect(result).toEqual(mockPhoto);
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to upload');
    mockedApi.post.mockRejectedValue(error);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await expect(
      postCreatePhoto('album1', { title: 'Photo', file }),
    ).rejects.toThrow('Failed to upload');
  });
});
