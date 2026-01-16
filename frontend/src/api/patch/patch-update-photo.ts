import api from '../../services/api';
import { Photo } from '../../types/photo';

interface UpdatePhotoData {
  title?: string;
  description?: string;
  acquisitionDate?: string;
}

export const patchUpdatePhoto = async (
  albumId: string,
  photoId: string,
  data: UpdatePhotoData,
): Promise<Photo> => {
  const response = await api.patch<Photo>(
    `/albums/${albumId}/photos/${photoId}`,
    data,
  );
  return response.data;
};
