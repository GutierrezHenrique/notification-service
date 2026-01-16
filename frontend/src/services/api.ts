import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Configurar baseURL removendo /api duplicado se necessário
const getBaseURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  // Se a URL já termina com /api, remove para evitar duplicação
  if (apiUrl.endsWith('/api')) {
    return apiUrl;
  }
  if (apiUrl.endsWith('/api/')) {
    return apiUrl.slice(0, -1); // Remove a barra final
  }
  // Se não termina com /api, adiciona
  return `${apiUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Usar o store diretamente para obter o token atualizado
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Garantir que o header seja removido se não houver token
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Usar o método logout do store
      const { logout } = useAuthStore.getState();
      logout();
      // Redirecionar apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
