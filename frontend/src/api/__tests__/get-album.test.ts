import { getAlbum } from '../get/get-album';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('getAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch album successfully', async () => {
    const mockAlbum = {
      id: '1',
      title: 'Album 1',
      description: 'Description 1',
      createdAt: '2024-01-01',
    };

    mockedApi.get.mockResolvedValue({ data: mockAlbum });

    const result = await getAlbum('1');

    expect(mockedApi.get).toHaveBeenCalledWith('/albums/1');
    expect(result).toEqual(mockAlbum);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValue(error);

    await expect(getAlbum('1')).rejects.toThrow('Network error');
  });
});
