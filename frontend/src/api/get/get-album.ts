import api from '../../services/api';
import { Album } from '../../types/album';

export const getAlbum = async (id: string): Promise<Album> => {
  const response = await api.get<Album>(`/albums/${id}`);
  return response.data;
};
