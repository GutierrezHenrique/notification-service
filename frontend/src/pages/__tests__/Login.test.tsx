import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../Login';
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

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    const mockLogin = jest.fn();
    (useAuthHook.useLogin as jest.Mock).mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      isError: false,
    });

    render(<Login />, { wrapper });

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const mockLogin = jest.fn();
    (useAuthHook.useLogin as jest.Mock).mockReturnValue({
      mutate: mockLogin,
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(<Login />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  it('should call login mutation on submit', async () => {
    const mockMutate = jest.fn();
    (useAuthHook.useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    });

    const user = userEvent.setup();
    render(<Login />, { wrapper });

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message when login fails', () => {
    (useAuthHook.useLogin as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: { response: { data: { message: 'Invalid credentials' } } },
    });

    render(<Login />, { wrapper });

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useAuthHook.useLogin as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isError: false,
    });

    render(<Login />, { wrapper });

    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
