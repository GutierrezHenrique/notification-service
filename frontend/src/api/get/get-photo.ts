import api from '../../services/api';
import { Photo } from '../../types/photo';

export const getPhoto = async (
  albumId: string,
  photoId: string,
): Promise<Photo> => {
  const response = await api.get<Photo>(`/albums/${albumId}/photos/${photoId}`);
  return response.data;
};
