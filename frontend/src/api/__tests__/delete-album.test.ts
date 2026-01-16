import { deleteAlbum } from '../delete/delete-album';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('deleteAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete album successfully', async () => {
    mockedApi.delete.mockResolvedValue({ data: undefined });

    await deleteAlbum('1');

    expect(mockedApi.delete).toHaveBeenCalledWith('/albums/1');
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to delete');
    mockedApi.delete.mockRejectedValue(error);

    await expect(deleteAlbum('1')).rejects.toThrow('Failed to delete');
  });
});
