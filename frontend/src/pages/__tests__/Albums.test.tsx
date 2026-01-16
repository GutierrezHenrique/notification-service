import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Albums from '../Albums';
import * as useAlbumsHook from '../../hooks/useAlbums';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../hooks/useAlbums');
jest.mock('../../store/authStore');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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

describe('Albums', () => {
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
    (useAlbumsHook.useAlbums as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<Albums />, { wrapper });
    expect(screen.getByText(/carregando álbuns/i)).toBeInTheDocument();
  });

  it('should render empty state when no albums', () => {
    (useAlbumsHook.useAlbums as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useAlbumsHook.useDeleteAlbum as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<Albums />, { wrapper });
    expect(screen.getByText(/nenhum álbum criado ainda/i)).toBeInTheDocument();
  });

  it('should render albums list', () => {
    const mockAlbums = [
      {
        id: '1',
        title: 'Album 1',
        description: 'Description 1',
        userId: '1',
        createdAt: '2024-01-01',
        photos: [],
      },
    ];

    (useAlbumsHook.useAlbums as jest.Mock).mockReturnValue({
      data: mockAlbums,
      isLoading: false,
    });
    (useAlbumsHook.useDeleteAlbum as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<Albums />, { wrapper });
    expect(screen.getByText(/album 1/i)).toBeInTheDocument();
    expect(screen.getByText(/description 1/i)).toBeInTheDocument();
  });

  it('should open create modal when button is clicked', async () => {
    const user = userEvent.setup();
    (useAlbumsHook.useAlbums as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useAlbumsHook.useDeleteAlbum as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
    });

    render(<Albums />, { wrapper });

    const createButton = screen.getByRole('button', {
      name: /criar novo álbum/i,
    });
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/criar novo álbum/i)).toBeInTheDocument();
    });
  });
});
