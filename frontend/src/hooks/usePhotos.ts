import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPhotos } from '../api/get/get-photos';
import { getPhoto } from '../api/get/get-photo';
import { searchPhotos } from '../api/get/search-photos';
import { postCreatePhoto } from '../api/post/post-create-photo';
import { patchUpdatePhoto } from '../api/patch/patch-update-photo';
import { deletePhoto } from '../api/delete/delete-photo';
import { deletePhotos } from '../api/delete/delete-photos';

interface CreatePhotoData {
  title: string;
  description?: string;
  acquisitionDate?: string;
  file: File;
}

interface UpdatePhotoData {
  title?: string;
  description?: string;
  acquisitionDate?: string;
}

export const usePhotos = (
  albumId: string,
  orderBy: 'asc' | 'desc' = 'desc',
  page: number = 1,
  limit: number = 50,
) => {
  return useQuery({
    queryKey: ['albums', albumId, 'photos', orderBy, page, limit],
    queryFn: () => getPhotos(albumId, orderBy, page, limit),
    enabled: !!albumId,
  });
};

export const usePhoto = (albumId: string, photoId: string) => {
  return useQuery({
    queryKey: ['albums', albumId, 'photos', photoId],
    queryFn: () => getPhoto(albumId, photoId),
    enabled: !!albumId && !!photoId,
  });
};

export const useCreatePhoto = (albumId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhotoData) => postCreatePhoto(albumId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['albums', albumId, 'photos'],
      });
      queryClient.invalidateQueries({ queryKey: ['albums', albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

export const useUpdatePhoto = (albumId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhotoData }) =>
      patchUpdatePhoto(albumId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['albums', albumId, 'photos'],
      });
      queryClient.invalidateQueries({
        queryKey: ['albums', albumId, 'photos', variables.id],
      });
    },
  });
};

export const useDeletePhoto = (albumId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePhoto(albumId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['albums', albumId, 'photos'],
      });
      queryClient.invalidateQueries({ queryKey: ['albums', albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

export const useDeletePhotos = (albumId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deletePhotos(albumId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['albums', albumId, 'photos'],
      });
      queryClient.invalidateQueries({ queryKey: ['albums', albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

export const useSearchPhotos = (
  query: string,
  orderBy: 'asc' | 'desc' = 'desc',
  page: number = 1,
  limit: number = 50,
) => {
  return useQuery({
    queryKey: ['photos', 'search', query, orderBy, page, limit],
    queryFn: () => searchPhotos(query, orderBy, page, limit),
    enabled: !!query && query.trim().length >= 2,
  });
};
