import api from '../../services/api';
import { User } from '../../types/user';

export const getUserMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};
