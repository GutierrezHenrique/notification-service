import { getUserMe } from '../get/get-user-me';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('getUserMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
    };

    mockedApi.get.mockResolvedValue({ data: mockUser });

    const result = await getUserMe();

    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockUser);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValue(error);

    await expect(getUserMe()).rejects.toThrow('Network error');
  });
});
