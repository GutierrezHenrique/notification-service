import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with null values', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set auth and update state', () => {
    const { result } = renderHook(() => useAuthStore());

    const user = { id: '1', email: 'test@test.com', name: 'Test User' };
    const token = 'test-token';

    act(() => {
      result.current.setAuth(user, token);
    });

    expect(result.current.user).toEqual(user);
    expect(result.current.token).toBe(token);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const { result } = renderHook(() => useAuthStore());

    const user = { id: '1', email: 'test@test.com', name: 'Test User' };
    const token = 'test-token';

    act(() => {
      result.current.setAuth(user, token);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
