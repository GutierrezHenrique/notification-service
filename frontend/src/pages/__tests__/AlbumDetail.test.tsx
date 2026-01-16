import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AlbumDetail from '../AlbumDetail';
import * as useAlbumsHook from '../../hooks/useAlbums';
import * as usePhotosHook from '../../hooks/usePhotos';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../hooks/useAlbums');
jest.mock('../../hooks/usePhotos');
jest.mock('../../store/authStore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('AlbumDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: { id: '1', email: 'test@test.com', name: 'Test User' },
      token: 'token',
      isAuthenticated: true,
      logout: jest.fn(),
      setAuth: jest.fn(),
    });
  });

  it('should render loading state', () => {
    (useAlbumsHook.useAlbum as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (usePhotosHook.usePhotos as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });
    (usePhotosHook.useDeletePhoto as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<AlbumDetail />, { wrapper });
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it('should render album details', () => {
    const mockAlbum = {
      id: '1',
      title: 'Test Album',
      description: 'Test Description',
      userId: '1',
      createdAt: '2024-01-01',
    };

    (useAlbumsHook.useAlbum as jest.Mock).mockReturnValue({
      data: mockAlbum,
      isLoading: false,
    });
    (usePhotosHook.usePhotos as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (usePhotosHook.useDeletePhoto as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<AlbumDetail />, { wrapper });
    expect(screen.getByText(/test album/i)).toBeInTheDocument();
    expect(screen.getByText(/test description/i)).toBeInTheDocument();
  });

  it('should render empty state when no photos', () => {
    const mockAlbum = {
      id: '1',
      title: 'Test Album',
      description: 'Test Description',
      userId: '1',
      createdAt: '2024-01-01',
    };

    (useAlbumsHook.useAlbum as jest.Mock).mockReturnValue({
      data: mockAlbum,
      isLoading: false,
    });
    (usePhotosHook.usePhotos as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (usePhotosHook.useDeletePhoto as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<AlbumDetail />, { wrapper });
    expect(
      screen.getByText(/nenhuma foto neste álbum ainda/i),
    ).toBeInTheDocument();
  });

  it('should render photos in thumbnails view', () => {
    const mockAlbum = {
      id: '1',
      title: 'Test Album',
      description: 'Test Description',
      userId: '1',
      createdAt: '2024-01-01',
    };

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

    (useAlbumsHook.useAlbum as jest.Mock).mockReturnValue({
      data: mockAlbum,
      isLoading: false,
    });
    (usePhotosHook.usePhotos as jest.Mock).mockReturnValue({
      data: mockPhotos,
      isLoading: false,
    });
    (usePhotosHook.useDeletePhoto as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<AlbumDetail />, { wrapper });
    expect(screen.getByText(/photo 1/i)).toBeInTheDocument();
  });

  it('should switch to table view', async () => {
    const user = userEvent.setup();
    const mockAlbum = {
      id: '1',
      title: 'Test Album',
      description: 'Test Description',
      userId: '1',
      createdAt: '2024-01-01',
    };

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

    (useAlbumsHook.useAlbum as jest.Mock).mockReturnValue({
      data: mockAlbum,
      isLoading: false,
    });
    (usePhotosHook.usePhotos as jest.Mock).mockReturnValue({
      data: mockPhotos,
      isLoading: false,
    });
    (usePhotosHook.useDeletePhoto as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<AlbumDetail />, { wrapper });

    const tableButton = screen.getByRole('button', { name: /tabela/i });
    await user.click(tableButton);

    expect(screen.getByText(/tamanho/i)).toBeInTheDocument();
  });
});
