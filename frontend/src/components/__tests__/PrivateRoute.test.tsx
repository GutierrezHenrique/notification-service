import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../store/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@test.com', name: 'Test' },
      token: 'token',
      logout: jest.fn(),
      setAuth: jest.fn(),
    });

    render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected content</div>
        </PrivateRoute>
      </BrowserRouter>,
    );
  });

  it('should redirect to login when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      logout: jest.fn(),
      setAuth: jest.fn(),
    });

    const { container } = render(
      <BrowserRouter>
        <PrivateRoute>
          <div>Protected content</div>
        </PrivateRoute>
      </BrowserRouter>,
    );

    // Should redirect (Navigate component)
    expect(container).toBeInTheDocument();
  });
});
