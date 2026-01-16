import api from '../../services/api';
import { Photo } from '../../types/photo';

export interface PaginatedPhotos {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
}

export const getPhotos = async (
  albumId: string,
  orderBy?: 'asc' | 'desc',
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedPhotos> => {
  const params: any = {};
  if (orderBy) params.orderBy = orderBy;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await api.get<PaginatedPhotos>(`/albums/${albumId}/photos`, {
    params,
  });
  return response.data;
};
