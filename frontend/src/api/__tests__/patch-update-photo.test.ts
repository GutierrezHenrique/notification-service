import { patchUpdatePhoto } from '../patch/patch-update-photo';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('patchUpdatePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update photo successfully', async () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    const mockPhoto = {
      id: '1',
      title: 'Updated Title',
      filename: 'photo.jpg',
      size: 1024,
      acquisitionDate: '2024-01-01',
      dominantColor: '#FF0000',
      createdAt: '2024-01-01',
    };

    mockedApi.patch.mockResolvedValue({ data: mockPhoto });

    const result = await patchUpdatePhoto('album1', 'photo1', updateData);

    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/albums/album1/photos/photo1',
      updateData,
    );
    expect(result).toEqual(mockPhoto);
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to update');
    mockedApi.patch.mockRejectedValue(error);

    await expect(
      patchUpdatePhoto('album1', 'photo1', { title: 'New Title' }),
    ).rejects.toThrow('Failed to update');
  });
});
