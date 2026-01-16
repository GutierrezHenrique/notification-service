import api from '../../services/api';

export const deleteAlbum = async (id: string): Promise<void> => {
  await api.delete(`/albums/${id}`);
};
