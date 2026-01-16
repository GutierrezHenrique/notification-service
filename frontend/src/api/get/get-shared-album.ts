import api from '../../services/api';
import { Album } from '../../types/album';

export const getSharedAlbum = async (shareToken: string): Promise<Album> => {
  const response = await api.get<Album>(`/albums/shared/${shareToken}`);
  return response.data;
};
