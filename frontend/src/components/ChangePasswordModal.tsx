import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useChangePassword } from '../hooks/useProfile';
import { getErrorMessage } from '../types/api';
import { Modal, Input, Button } from '../components/ui';
import { useToast } from '../providers/ToastProvider';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordForm>();

  const changePasswordMutation = useChangePassword();
  const { addToast } = useToast();

  const newPassword = watch('newPassword');

  const onSubmit = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          addToast('Senha alterada com sucesso!', 'success');
          reset();
          onClose();
        },
      },
    );
  };

  useEffect(() => {
    if (changePasswordMutation.isError) {
      addToast(
        getErrorMessage(changePasswordMutation.error) ||
          'Erro ao alterar senha',
        'error',
      );
    }
  }, [
    changePasswordMutation.isError,
    changePasswordMutation.error,
    addToast,
  ]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar Senha"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="currentPassword"
          type="password"
          label="Senha Atual"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword', {
            required: 'Senha atual é obrigatória',
          })}
        />

        <Input
          id="newPassword"
          type="password"
          label="Nova Senha"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'Nova senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter no mínimo 6 caracteres',
            },
          })}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirmar Nova Senha"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirmação de senha é obrigatória',
            validate: (value) =>
              value === newPassword || 'As senhas não coincidem',
          })}
        />

        <div className="flex gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={changePasswordMutation.isPending}
            className="flex-1"
          >
            Alterar Senha
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
