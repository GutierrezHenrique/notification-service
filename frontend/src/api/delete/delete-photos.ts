import api from '../../services/api';

export const deletePhotos = async (
  albumId: string,
  photoIds: string[],
): Promise<void> => {
  await api.delete(`/albums/${albumId}/photos/batch`, {
    data: { ids: photoIds },
  });
};
