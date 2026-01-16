import { postLogin } from '../post/post-login';
import api from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('postLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const loginData = {
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

    const result = await postLogin(loginData);

    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', loginData);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors', async () => {
    const error = new Error('Invalid credentials');
    mockedApi.post.mockRejectedValue(error);

    await expect(
      postLogin({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
  });
});
