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
      // Garantir que o token não tenha "Bearer " duplicado
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      config.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      // Garantir que o header seja removido se não houver token
      delete config.headers.Authorization;
    }

    // Log para debug (apenas em desenvolvimento)
    if (import.meta.env.DEV && config.url) {
      console.debug('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
      });
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
    // Apenas fazer logout se for realmente um erro de autenticação (401)
    // e não um erro de conexão ou timeout
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().token;

      // Log para debug
      console.warn('401 Unauthorized:', {
        url: error.config?.url,
        hasToken: !!token,
        pathname: window.location.pathname,
      });

      // Só fazer logout se realmente tiver um token (significa que o token é inválido)
      // Se não tiver token, pode ser que a requisição foi feita antes do login
      if (token) {
        const { logout } = useAuthStore.getState();
        logout();
        // Redirecionar apenas se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND'
    ) {
      // Erros de conexão não devem fazer logout
      console.error('Connection error:', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
