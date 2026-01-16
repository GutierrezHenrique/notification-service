import { useForm } from 'react-hook-form';
import { useUpdateAlbum } from '../hooks/useAlbums';
import { getErrorMessage } from '../types/api';
import { Album } from '../types/album';
import { Modal, Input, Textarea, Button, Alert } from '../components/ui';

interface EditAlbumForm {
  title: string;
  description: string;
}

interface EditAlbumModalProps {
  album: Album;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAlbumModal = ({ album, onClose, onSuccess }: EditAlbumModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditAlbumForm>({
    defaultValues: {
      title: album.title,
      description: album.description || '',
    },
  });

  const updateAlbumMutation = useUpdateAlbum();

  const onSubmit = (data: EditAlbumForm) => {
    updateAlbumMutation.mutate(
      { id: album.id, data },
      {
        onSuccess: () => {
          onSuccess();
        },
      },
    );
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Editar álbum" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="title"
          type="text"
          label="Título"
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
          {...register('description')}
        />

        {updateAlbumMutation.isError && (
          <Alert type="error">
            {getErrorMessage(updateAlbumMutation.error) ||
              'Erro ao atualizar álbum'}
          </Alert>
        )}

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
            isLoading={updateAlbumMutation.isPending}
            className="flex-1"
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAlbumModal;
