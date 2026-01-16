import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateAlbumModal from '../CreateAlbumModal';
import * as useAlbumsHook from '../../hooks/useAlbums';

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

describe('CreateAlbumModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAlbumsHook.useCreateAlbum as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: false,
    });
  });

  it('should render modal with form', () => {
    render(
      <CreateAlbumModal onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper },
    );

    expect(screen.getByText(/criar novo álbum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CreateAlbumModal onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper },
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <CreateAlbumModal onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper },
    );

    const submitButton = screen.getByRole('button', { name: /concluir/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockMutate = jest.fn();
    (useAlbumsHook.useCreateAlbum as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(
      <CreateAlbumModal onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper },
    );

    const titleInput = screen.getByLabelText(/título/i);
    const descriptionInput = screen.getByLabelText(/descrição/i);
    const submitButton = screen.getByRole('button', { name: /concluir/i });

    await user.type(titleInput, 'My Album');
    await user.type(descriptionInput, 'Album description');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should display error message', () => {
    (useAlbumsHook.useCreateAlbum as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Error creating album' } } },
    });

    render(
      <CreateAlbumModal onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper },
    );

    expect(screen.getByText(/error creating album/i)).toBeInTheDocument();
  });
});
