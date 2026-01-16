import api from '../../services/api';
import { Photo } from '../../types/photo';

export interface PaginatedPhotos {
  photos: Photo[];
  total: number;
  page: number;
  limit: number;
}

export const searchPhotos = async (
  query: string,
  orderBy?: 'asc' | 'desc',
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedPhotos> => {
  const params: any = { q: query };
  if (orderBy) params.orderBy = orderBy;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await api.get<PaginatedPhotos>('/photos/search', {
    params,
  });
  return response.data;
};
