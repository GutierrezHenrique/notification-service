import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UploadPhotoModal from '../UploadPhotoModal';
import * as usePhotosHook from '../../hooks/usePhotos';

jest.mock('../../hooks/usePhotos');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('UploadPhotoModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePhotosHook.useCreatePhoto as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({}),
      isPending: false,
      isError: false,
    });
  });

  it('should render modal with form', () => {
    render(
      <UploadPhotoModal
        albumId="1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    expect(screen.getByText(/adicionar novas fotos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/título da foto/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <UploadPhotoModal
        albumId="1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    const cancelButton = screen.getByRole('button', { name: /fechar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <UploadPhotoModal
        albumId="1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('should display error message', () => {
    (usePhotosHook.useCreatePhoto as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Error uploading photo' } } },
    });

    render(
      <UploadPhotoModal
        albumId="1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    expect(screen.getByText(/error uploading photo/i)).toBeInTheDocument();
  });
});
