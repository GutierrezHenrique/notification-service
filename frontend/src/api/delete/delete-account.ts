import api from '../../services/api';

export const deleteAccount = async (): Promise<void> => {
  await api.delete('/users/me');
};
