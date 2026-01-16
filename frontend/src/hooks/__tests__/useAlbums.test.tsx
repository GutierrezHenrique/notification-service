import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAlbums, useAlbum, useCreateAlbum } from '../useAlbums';
import * as albumsApi from '../../api/get/get-albums';
import * as albumApi from '../../api/get/get-album';
import * as createAlbumApi from '../../api/post/post-create-album';

jest.mock('../../api/get/get-albums');
jest.mock('../../api/get/get-album');
jest.mock('../../api/post/post-create-album');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAlbums', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch albums', async () => {
    const mockAlbums = [
      {
        id: '1',
        title: 'Album 1',
        description: 'Desc 1',
        createdAt: '2024-01-01',
      },
    ];
    (albumsApi.getAlbums as jest.Mock).mockResolvedValue(mockAlbums);

    const { result } = renderHook(() => useAlbums(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAlbums);
  });

  it('should handle fetch error', async () => {
    (albumsApi.getAlbums as jest.Mock).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useAlbums(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch single album', async () => {
    const mockAlbum = {
      id: '1',
      title: 'Album 1',
      description: 'Desc 1',
      createdAt: '2024-01-01',
    };
    (albumApi.getAlbum as jest.Mock).mockResolvedValue(mockAlbum);

    const { result } = renderHook(() => useAlbum('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAlbum);
  });
});

describe('useCreateAlbum', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should create album', async () => {
    const mockAlbum = {
      id: '1',
      title: 'New Album',
      description: 'New Desc',
      createdAt: '2024-01-01',
    };
    (createAlbumApi.postCreateAlbum as jest.Mock).mockResolvedValue(mockAlbum);

    const { result } = renderHook(() => useCreateAlbum(), { wrapper });

    result.current.mutate({ title: 'New Album', description: 'New Desc' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createAlbumApi.postCreateAlbum).toHaveBeenCalledWith({
      title: 'New Album',
      description: 'New Desc',
    });
  });
});
