import api from '../../services/api';
import { Album } from '../../types/album';

export const shareAlbum = async (
  albumId: string,
  isPublic: boolean,
): Promise<Album> => {
  const response = await api.patch<Album>(`/albums/${albumId}/share`, {
    isPublic,
  });
  return response.data;
};
