import { deletePhoto } from '../delete/delete-photo';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('deletePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete photo successfully', async () => {
    mockedApi.delete.mockResolvedValue({ data: undefined });

    await deletePhoto('album1', 'photo1');

    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/albums/album1/photos/photo1',
    );
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to delete');
    mockedApi.delete.mockRejectedValue(error);

    await expect(deletePhoto('album1', 'photo1')).rejects.toThrow(
      'Failed to delete',
    );
  });
});
