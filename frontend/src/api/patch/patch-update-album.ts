import api from '../../services/api';
import { Album } from '../../types/album';

interface UpdateAlbumData {
  title?: string;
  description?: string;
}

export const patchUpdateAlbum = async (
  id: string,
  data: UpdateAlbumData,
): Promise<Album> => {
  const response = await api.patch<Album>(`/albums/${id}`, data);
  return response.data;
};
