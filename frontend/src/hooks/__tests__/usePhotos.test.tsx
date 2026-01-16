import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  usePhotos,
  usePhoto,
  useCreatePhoto,
  useUpdatePhoto,
  useDeletePhoto,
} from '../usePhotos';
import * as photosApi from '../../api/get/get-photos';
import * as photoApi from '../../api/get/get-photo';
import * as createPhotoApi from '../../api/post/post-create-photo';
import * as updatePhotoApi from '../../api/patch/patch-update-photo';
import * as deletePhotoApi from '../../api/delete/delete-photo';

jest.mock('../../api/get/get-photos');
jest.mock('../../api/get/get-photo');
jest.mock('../../api/post/post-create-photo');
jest.mock('../../api/patch/patch-update-photo');
jest.mock('../../api/delete/delete-photo');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch photos', async () => {
    const mockPhotos = [
      {
        id: '1',
        title: 'Photo 1',
        filename: 'photo1.jpg',
        size: 1024,
        acquisitionDate: '2024-01-01',
        dominantColor: '#FF0000',
        createdAt: '2024-01-01',
      },
    ];
    (photosApi.getPhotos as jest.Mock).mockResolvedValue(mockPhotos);

    const { result } = renderHook(() => usePhotos('album1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPhotos);
  });
});

describe('usePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch single photo', async () => {
    const mockPhoto = {
      id: '1',
      title: 'Photo 1',
      filename: 'photo1.jpg',
      size: 1024,
      acquisitionDate: '2024-01-01',
      dominantColor: '#FF0000',
      createdAt: '2024-01-01',
    };
    (photoApi.getPhoto as jest.Mock).mockResolvedValue(mockPhoto);

    const { result } = renderHook(() => usePhoto('album1', 'photo1'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPhoto);
  });
});

describe('useCreatePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should create photo', async () => {
    const mockPhoto = {
      id: '1',
      title: 'New Photo',
      filename: 'new.jpg',
      size: 1024,
      acquisitionDate: '2024-01-01',
      dominantColor: '#FF0000',
      createdAt: '2024-01-01',
    };
    (createPhotoApi.postCreatePhoto as jest.Mock).mockResolvedValue(mockPhoto);

    const { result } = renderHook(() => useCreatePhoto('album1'), { wrapper });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    result.current.mutate({
      title: 'New Photo',
      file,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeletePhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should delete photo', async () => {
    (deletePhotoApi.deletePhoto as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePhoto('album1'), { wrapper });

    result.current.mutate('photo1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
