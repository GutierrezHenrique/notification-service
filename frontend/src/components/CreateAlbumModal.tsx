import { useForm } from 'react-hook-form';
import { useCreateAlbum } from '../hooks/useAlbums';
import { getErrorMessage } from '../types/api';
import { Modal, Input, Textarea, Button } from '../components/ui';

interface CreateAlbumForm {
  title: string;
  description: string;
}

interface CreateAlbumModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

import { useEffect } from 'react';
import { useToast } from '../providers/ToastProvider';

const CreateAlbumModal = ({ onClose, onSuccess }: CreateAlbumModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAlbumForm>();

  const createAlbumMutation = useCreateAlbum();
  const { addToast } = useToast();

  const onSubmit = (data: CreateAlbumForm) => {
    createAlbumMutation.mutate(data, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  useEffect(() => {
    if (createAlbumMutation.isError) {
      addToast(getErrorMessage(createAlbumMutation.error) || 'Erro ao criar álbum', 'error');
    }
  }, [createAlbumMutation.isError, createAlbumMutation.error, addToast]);

  return (
    <Modal isOpen={true} onClose={onClose} title="Criar novo álbum" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="title"
          type="text"
          label="Título"
          placeholder="Álbum 1"
          error={errors.title?.message}
          {...register('title', {
            required: 'Título é obrigatório',
            minLength: {
              value: 1,
              message: 'Título deve ter no mínimo 1 caractere',
            },
          })}
        />

        <Textarea
          id="description"
          label="Descrição"
          rows={4}
          placeholder="Descrição do álbum um"
          {...register('description')}
        />

        <div className="flex gap-4">
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
            isLoading={createAlbumMutation.isPending}
            className="flex-1"
          >
            Concluir
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAlbumModal;
