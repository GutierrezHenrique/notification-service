import { useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';
import api from './services/api';
import { ToastProvider } from './providers/ToastProvider';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Albums = lazy(() => import('./pages/Albums'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));
const SharedAlbum = lazy(() => import('./pages/SharedAlbum'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));

function App() {
  const { token, _hasHydrated } = useAuthStore();

  // Sincronizar token com axios quando mudar
  useEffect(() => {
    if (_hasHydrated) {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    }
  }, [token, _hasHydrated]);

  return (
    <Router>
      <ToastProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/shared/:shareToken" element={<SharedAlbum />} />
            <Route
              path="/albums"
              element={
                <PrivateRoute>
                  <Albums />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums/:id"
              element={
                <PrivateRoute>
                  <AlbumDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/albums" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </Router>
  );
}

export default App;
