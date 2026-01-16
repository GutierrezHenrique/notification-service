import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { useLogin, useRegister } from '../useAuth';
import * as loginApi from '../../api/post/post-login';
import * as registerApi from '../../api/post/post-register';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../api/post/post-login');
jest.mock('../../api/post/post-register');
jest.mock('../../store/authStore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setAuth: jest.fn(),
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      access_token: 'token',
    };
    (loginApi.postLogin as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      email: 'test@test.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      setAuth: jest.fn(),
    });
  });

  it('should register successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      access_token: 'token',
    };
    (registerApi.postRegister as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
