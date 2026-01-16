import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlbums } from '../api/get/get-albums';
import { getAlbum } from '../api/get/get-album';
import { getSharedAlbum } from '../api/get/get-shared-album';
import { postCreateAlbum } from '../api/post/post-create-album';
import { patchUpdateAlbum } from '../api/patch/patch-update-album';
import { shareAlbum } from '../api/patch/patch-share-album';
import { deleteAlbum } from '../api/delete/delete-album';

interface UpdateAlbumData {
  title?: string;
  description?: string;
}

export const useAlbums = () => {
  return useQuery({
    queryKey: ['albums'],
    queryFn: getAlbums,
  });
};

export const useAlbum = (id: string) => {
  return useQuery({
    queryKey: ['albums', id],
    queryFn: () => getAlbum(id),
    enabled: !!id,
  });
};

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCreateAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

export const useUpdateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlbumData }) =>
      patchUpdateAlbum(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums', variables.id] });
    },
  });
};

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
};

export const useShareAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      shareAlbum(id, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums', variables.id] });
    },
  });
};

export const useSharedAlbum = (shareToken: string) => {
  return useQuery({
    queryKey: ['albums', 'shared', shareToken],
    queryFn: () => getSharedAlbum(shareToken),
    enabled: !!shareToken,
  });
};
