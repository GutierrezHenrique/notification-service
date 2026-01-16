import { getPhoto } from '../get/get-photo';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('getPhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch photo successfully', async () => {
    const mockPhoto = {
      id: '1',
      title: 'Photo 1',
      filename: 'photo1.jpg',
      size: 1024,
      acquisitionDate: '2024-01-01',
      dominantColor: '#FF0000',
      createdAt: '2024-01-01',
    };

    mockedApi.get.mockResolvedValue({ data: mockPhoto });

    const result = await getPhoto('album1', 'photo1');

    expect(mockedApi.get).toHaveBeenCalledWith('/albums/album1/photos/photo1');
    expect(result).toEqual(mockPhoto);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValue(error);

    await expect(getPhoto('album1', 'photo1')).rejects.toThrow('Network error');
  });
});
