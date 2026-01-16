import api from '../../services/api';
import { Album } from '../../types/album';

interface CreateAlbumData {
  title: string;
  description?: string;
}

export const postCreateAlbum = async (
  data: CreateAlbumData,
): Promise<Album> => {
  const response = await api.post<Album>('/albums', data);
  return response.data;
};
