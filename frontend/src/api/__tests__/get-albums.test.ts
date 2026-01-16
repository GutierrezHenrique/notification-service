import { getAlbums } from '../get/get-albums';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('getAlbums', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch albums successfully', async () => {
    const mockAlbums = [
      {
        id: '1',
        title: 'Album 1',
        description: 'Description 1',
        createdAt: '2024-01-01',
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockAlbums });

    const result = await getAlbums();

    expect(mockedApi.get).toHaveBeenCalledWith('/albums');
    expect(result).toEqual(mockAlbums);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValue(error);

    await expect(getAlbums()).rejects.toThrow('Network error');
  });
});
