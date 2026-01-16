import { postRegister } from '../post/post-register';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('postRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register successfully', async () => {
    const registerData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
    };

    const mockResponse = {
      access_token: 'token',
      user: {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      },
    };

    mockedApi.post.mockResolvedValue({ data: mockResponse });

    const result = await postRegister(registerData);

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', registerData);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    const error = new Error('Email already exists');
    mockedApi.post.mockRejectedValue(error);

    await expect(
      postRegister({
        name: 'Test',
        email: 'test@test.com',
        password: 'password',
      }),
    ).rejects.toThrow('Email already exists');
  });
});
