import api from '../../services/api';
import { Album } from '../../types/album';

export const getAlbums = async (): Promise<Album[]> => {
  const response = await api.get<Album[]>('/albums');
  return response.data;
};
