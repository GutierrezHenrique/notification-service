import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useUser } from '../useUser';
import * as userApi from '../../api/get/get-user-me';

jest.mock('../../api/get/get-user-me');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch user data', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
    };
    (userApi.getUserMe as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });

  it('should handle fetch error', async () => {
    (userApi.getUserMe as jest.Mock).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
