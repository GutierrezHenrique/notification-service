import api from '../../services/api';

interface ResetPasswordData {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const postResetPassword = async (
  data: ResetPasswordData,
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    '/auth/reset-password',
    data,
  );
  return response.data;
};
