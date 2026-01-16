import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Register from '../Register';
import * as useAuthHook from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');
jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    setAuth: jest.fn(),
  }),
}));

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    const mockRegister = jest.fn();
    (useAuthHook.useRegister as jest.Mock).mockReturnValue({
      mutate: mockRegister,
      isPending: false,
      isError: false,
    });

    render(<Register />, { wrapper });

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const mockRegister = jest.fn();
    (useAuthHook.useRegister as jest.Mock).mockReturnValue({
      mutate: mockRegister,
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(<Register />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /concluir/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  it('should validate password match', async () => {
    const mockRegister = jest.fn();
    (useAuthHook.useRegister as jest.Mock).mockReturnValue({
      mutate: mockRegister,
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(<Register />, { wrapper });

    const passwordInput = screen.getByLabelText(/senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');

    const submitButton = screen.getByRole('button', { name: /concluir/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it('should call register mutation on submit', async () => {
    const mockMutate = jest.fn();
    (useAuthHook.useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(<Register />, { wrapper });

    const nameInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole('button', { name: /concluir/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message when register fails', () => {
    (useAuthHook.useRegister as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Email already exists' } } },
    });

    render(<Register />, { wrapper });

    expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
  });
});
