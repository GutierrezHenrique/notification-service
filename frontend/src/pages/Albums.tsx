import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlbums, useDeleteAlbum } from '../hooks/useAlbums';
import CreateAlbumModal from '../components/CreateAlbumModal';
import { getErrorMessage } from '../types/api';
import {
  Header,
  Button,
  Loading,
  Card,
  EmptyState,
  ConfirmationDialog,
} from '../components/ui';
import { useToast } from '../providers/ToastProvider';

const Albums = () => {
  const navigate = useNavigate();
  const { data: albums = [], isLoading } = useAlbums();
  const deleteAlbumMutation = useDeleteAlbum();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    setAlbumToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAlbum = async () => {
    if (!albumToDelete) return;

    try {
      await deleteAlbumMutation.mutateAsync(albumToDelete);
      setAlbumToDelete(null);
      addToast('Álbum excluído com sucesso', 'success');
      setShowDeleteConfirm(false);
    } catch (error) {
      addToast(getErrorMessage(error) || 'Erro ao excluir álbum', 'error');
      setAlbumToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Carregando álbuns..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Meus álbuns" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate__animated animate__fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sua Galeria</h2>
            <p className="text-slate-500 text-sm mt-1">Gerencie seus momentos especiais</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-indigo-500/30 w-full sm:w-auto">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Álbum
          </Button>
        </div>

        {albums.length === 0 ? (
          <div className="mt-12 animate__animated animate__fadeInUp">
            <EmptyState
              title="Nenhum álbum criado ainda"
              description="Comece criando seu primeiro álbum de fotos para organizar suas memórias."
              actionLabel="Criar primeiro álbum"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <Card
                key={album.id}
                hover
                onClick={() => navigate(`/albums/${album.id}`)}
                className="group h-full flex flex-col border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  {album.photos && album.photos.length > 0 && album.photos[0].url ? (
                    <img
                      src={album.photos[0].url}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Sem fotos</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <span className="text-white text-xs font-medium">
                      {album.photos?.length || 0} foto(s)
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {album.title}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                    {album.description || 'Sem descrição'}
                  </p>

                  <div className="pt-4 mt-auto border-t border-slate-100 flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(album.id);
                      }}
                      className="gap-1 pl-2 pr-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateAlbumModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            addToast('Álbum criado com sucesso!', 'success');
          }}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAlbumToDelete(null);
        }}
        onConfirm={confirmDeleteAlbum}
        title="Excluir Álbum"
        message="Tem certeza que deseja excluir este álbum? Todas as fotos serão perdidas permanentemente."
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Albums;
