import { patchUpdateAlbum } from '../patch/patch-update-album';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('patchUpdateAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update album successfully', async () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    const mockAlbum = {
      id: '1',
      title: 'Updated Title',
      description: 'Updated Description',
      createdAt: '2024-01-01',
    };

    mockedApi.patch.mockResolvedValue({ data: mockAlbum });

    const result = await patchUpdateAlbum('1', updateData);

    expect(mockedApi.patch).toHaveBeenCalledWith('/albums/1', updateData);
    expect(result).toEqual(mockAlbum);
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to update');
    mockedApi.patch.mockRejectedValue(error);

    await expect(patchUpdateAlbum('1', { title: 'New Title' })).rejects.toThrow(
      'Failed to update',
    );
  });
});
