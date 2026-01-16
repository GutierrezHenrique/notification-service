import api from '../../services/api';

export const deletePhoto = async (
  albumId: string,
  photoId: string,
): Promise<void> => {
  await api.delete(`/albums/${albumId}/photos/${photoId}`);
};
