import api from '../../services/api';

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const postForgotPassword = async (
  data: ForgotPasswordData,
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    data,
  );
  return response.data;
};
