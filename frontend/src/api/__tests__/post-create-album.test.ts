import { postCreateAlbum } from '../post/post-create-album';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('postCreateAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create album successfully', async () => {
    const albumData = {
      title: 'New Album',
      description: 'New Description',
    };

    const mockAlbum = {
      id: '1',
      ...albumData,
      createdAt: '2024-01-01',
    };

    mockedApi.post.mockResolvedValue({ data: mockAlbum });

    const result = await postCreateAlbum(albumData);

    expect(mockedApi.post).toHaveBeenCalledWith('/albums', albumData);
    expect(result).toEqual(mockAlbum);
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to create');
    mockedApi.post.mockRejectedValue(error);

    await expect(postCreateAlbum({ title: 'Test' })).rejects.toThrow(
      'Failed to create',
    );
  });
});
