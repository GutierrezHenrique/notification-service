import api from '../../services/api';
import { Photo } from '../../types/photo';

interface CreatePhotoData {
  title: string;
  description?: string;
  acquisitionDate?: string;
  file: File;
}

export const postCreatePhoto = async (
  albumId: string,
  data: CreatePhotoData,
): Promise<Photo> => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.acquisitionDate) {
    formData.append('acquisitionDate', data.acquisitionDate);
  }

  const response = await api.post<Photo>(
    `/albums/${albumId}/photos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};
