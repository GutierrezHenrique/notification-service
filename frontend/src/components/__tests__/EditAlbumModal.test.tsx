import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditAlbumModal from '../EditAlbumModal';
import * as useAlbumsHook from '../../hooks/useAlbums';
import { Album } from '../../types/album';

jest.mock('../../hooks/useAlbums');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockAlbum: Album = {
  id: '1',
  title: 'Test Album',
  description: 'Test Description',
  userId: '1',
  createdAt: '2024-01-01',
};

describe('EditAlbumModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlbumsHook.useUpdateAlbum as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
    });
  });

  it('should render modal with form', () => {
    render(
      <EditAlbumModal
        album={mockAlbum}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    expect(screen.getByText(/editar álbum/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/test album/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/test description/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EditAlbumModal
        album={mockAlbum}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <EditAlbumModal
        album={mockAlbum}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    const titleInput = screen.getByDisplayValue(/test album/i);
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should display error message', () => {
    (useAlbumsHook.useUpdateAlbum as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Error updating album' } } },
    });

    render(
      <EditAlbumModal
        album={mockAlbum}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    expect(screen.getByText(/error updating album/i)).toBeInTheDocument();
  });
});
