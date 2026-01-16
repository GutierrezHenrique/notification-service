import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useUpdateProfile } from '../hooks/useProfile';
import { useUser } from '../hooks/useUser';
import { getErrorMessage } from '../types/api';
import { Modal, Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';

interface EditProfileForm {
  name: string;
  email: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { data: user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const updateProfileMutation = useUpdateProfile();
  const { addToast } = useToast();

  // Atualizar valores do formulário quando o usuário carregar
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: EditProfileForm) => {
    // Não enviar email se o usuário fez login via OAuth
    const updateData: { name: string; email?: string } = {
      name: data.name,
    };

    // Só incluir email se o usuário não for OAuth
    if (user?.provider !== 'google') {
      updateData.email = data.email;
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        addToast('Perfil atualizado com sucesso!', 'success');
        onClose();
      },
    });
  };

  useEffect(() => {
    if (updateProfileMutation.isError) {
      addToast(
        getErrorMessage(updateProfileMutation.error) ||
          'Erro ao atualizar perfil',
        'error',
      );
    }
  }, [
    updateProfileMutation.isError,
    updateProfileMutation.error,
    addToast,
  ]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="Nome"
          placeholder="Seu nome"
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter no mínimo 2 caracteres',
            },
          })}
        />

        <Input
          id="email"
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
          error={errors.email?.message}
          disabled={user?.provider === 'google'}
          {...register('email', {
            required: user?.provider !== 'google' ? 'E-mail é obrigatório' : false,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'E-mail inválido',
            },
          })}
        />
        {user?.provider === 'google' && (
          <p className="text-sm text-gray-500 mt-1">
            O email não pode ser alterado para contas que fizeram login com Google.
          </p>
        )}

        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={updateProfileMutation.isPending}
            className="flex-1"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
