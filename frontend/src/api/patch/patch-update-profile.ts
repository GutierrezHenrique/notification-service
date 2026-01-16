import api from '../../services/api';
import { User, UpdateProfileData } from '../../types/user';

export const patchUpdateProfile = async (
  data: UpdateProfileData,
): Promise<User> => {
  const response = await api.patch<User>('/users/me', data);
  return response.data;
};
