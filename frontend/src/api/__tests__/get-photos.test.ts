import { getPhotos } from '../get/get-photos';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('getPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch photos successfully', async () => {
    const mockPhotos = [
      {
        id: '1',
        title: 'Photo 1',
        filename: 'photo1.jpg',
        size: 1024,
        acquisitionDate: '2024-01-01',
        dominantColor: '#FF0000',
        createdAt: '2024-01-01',
      },
    ];

    mockedApi.get.mockResolvedValue({ data: mockPhotos });

    const result = await getPhotos('album1');

    expect(mockedApi.get).toHaveBeenCalledWith('/albums/album1/photos');
    expect(result).toEqual(mockPhotos);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValue(error);

    await expect(getPhotos('album1')).rejects.toThrow('Network error');
  });
});
