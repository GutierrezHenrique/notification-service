import api from '../../services/api';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const patchChangePassword = async (
  data: ChangePasswordRequest,
): Promise<void> => {
  await api.patch('/users/me/password', data);
};
