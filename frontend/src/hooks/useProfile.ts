import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchUpdateProfile } from '../api/patch/patch-update-profile';
import { patchChangePassword, ChangePasswordRequest } from '../api/patch/patch-change-password';
import { deleteAccount } from '../api/delete/delete-account';
import { UpdateProfileData } from '../types/user';
import { useAuthStore } from '../store/authStore';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setAuth, user: authUser, token } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => patchUpdateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      // Atualizar o store de autenticação se o usuário atualizado for o mesmo
      if (authUser && updatedUser.id === authUser.id && token) {
        setAuth(
          {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
          },
          token,
        );
      }
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => patchChangePassword(data),
  });
};

export const useDeleteAccount = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout();
    },
  });
};
