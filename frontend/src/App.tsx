import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import SharedAlbum from './pages/SharedAlbum';
import Profile from './pages/Profile';
import Search from './pages/Search';
import PrivateRoute from './components/PrivateRoute';

import { ToastProvider } from './providers/ToastProvider';

function App() {
  return (
    <Router>
      <ToastProvider>
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
      </ToastProvider>
    </Router>
  );
}

export default App;
