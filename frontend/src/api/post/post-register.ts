import api from '../../services/api';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const postRegister = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};
