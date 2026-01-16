import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAlbum, useShareAlbum } from '../hooks/useAlbums';
import { usePhotos, useDeletePhoto, useDeletePhotos } from '../hooks/usePhotos';
import UploadPhotoModal from '../components/UploadPhotoModal';
import EditAlbumModal from '../components/EditAlbumModal';
import PhotoViewModal from '../components/PhotoViewModal';
import { Photo } from '../types/photo';
import { getErrorMessage } from '../types/api';
import {
  Header,
  Button,
  Loading,
  EmptyState,
  Table,
  TableRow,
  TableCell,
  ConfirmationDialog,
  Alert,
  Modal,
} from '../components/ui';

type ViewMode = 'thumbnails' | 'table';

const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: album, isLoading: albumLoading } = useAlbum(id || '');
  const shareAlbumMutation = useShareAlbum();
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { data: photosData, isLoading: photosLoading } = usePhotos(
    id || '',
    sortOrder,
    currentPage,
    pageSize,
  );
  const photos = photosData?.photos || [];
  const totalPhotos = photosData?.total || 0;
  const totalPages = Math.ceil(totalPhotos / pageSize);
  const deletePhotoMutation = useDeletePhoto(id || '');
  const deletePhotosMutation = useDeletePhotos(id || '');
  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleDeletePhoto = async (photoId: string) => {
    setPhotoToDelete(photoId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    try {
      await deletePhotoMutation.mutateAsync(photoToDelete);
      setPhotoToDelete(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error) || 'Erro ao excluir foto');
      setPhotoToDelete(null);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.size === photos.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(photos.map((p) => p.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotoIds.size === 0) return;

    try {
      await deletePhotosMutation.mutateAsync(Array.from(selectedPhotoIds));
      setSelectedPhotoIds(new Set());
      setIsSelectionMode(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error) || 'Erro ao excluir fotos');
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPhotoIds(new Set());
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string | null | undefined | Date): string => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Data não disponível';
    }
    try {
      // Handle Date object
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(date.getTime()) || date.getTime() === 0) {
        return 'Data não disponível';
      }
      return format(date, 'dd/MM/yyyy HH:mm', {
        locale: ptBR,
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  if (albumLoading || photosLoading) {
    return <Loading fullScreen text="Carregando..." />;
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Álbum não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Meus álbuns de fotos"
        showBackButton
        onBack={() => navigate('/albums')}
      />

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {errorMessage && (
          <div className="mb-4 max-w-4xl mx-auto">
            <Alert type="error">
              <div className="flex justify-between items-center">
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="ml-4 text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </Alert>
          </div>
        )}

        <div className="mb-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-4xl font-normal text-gray-900 tracking-tight mb-2">
                {album.title}
              </h2>
              <p className="text-gray-500 text-lg font-light">
                {album.description || 'Sem descrição'} • {totalPhotos} fotos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
              {isSelectionMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={exitSelectionMode}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar ({selectedPhotoIds.size} selecionadas)
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteSelected}
                    disabled={selectedPhotoIds.size === 0 || deletePhotosMutation.isPending}
                    isLoading={deletePhotosMutation.isPending}
                    className="gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir selecionadas
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSelectionMode(true)}
                    title="Selecionar múltiplas fotos"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    title="Ordenar"
                  >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'thumbnails' ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700' : ''}
                onClick={() => setViewMode('thumbnails')}
                title="Visualização em grade"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'table' ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700' : ''}
                onClick={() => setViewMode('table')}
                title="Visualização em lista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>

              <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant={album?.isPublic ? 'primary' : 'outline'}
                  onClick={() => setShowShareModal(true)}
                  className="gap-2 flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {album?.isPublic ? 'Compartilhado' : 'Compartilhar'}
                </Button>
                <Button onClick={() => setShowUploadModal(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md flex-1 sm:flex-none justify-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar fotos
                </Button>
                </>
              )}
              </div>
            </div>
          </div>

          {album?.isPublic && album?.shareToken && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-blue-800 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Link público ativo
              </span>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/shared/${album.shareToken}`;
                  navigator.clipboard.writeText(url);
                  // Idealmente usar toast aqui
                }}
                className="font-medium hover:underline text-blue-700"
              >
                Copiar link
              </button>
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="Nenhuma foto neste álbum ainda"
            description="Comece adicionando sua primeira foto para criar memórias."
            actionLabel="Adicionar fotos"
            onAction={() => setShowUploadModal(true)}
          />
        ) : viewMode === 'thumbnails' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${
                  isSelectionMode ? 'cursor-pointer' : 'cursor-pointer'
                } ${selectedPhotoIds.has(photo.id) ? 'ring-4 ring-indigo-500' : ''}`}
                onClick={() => {
                  if (isSelectionMode) {
                    togglePhotoSelection(photo.id);
                  } else {
                    setSelectedPhoto(photo);
                  }
                }}
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: photo.url
                      ? `url(${photo.url})`
                      : `url(http://localhost:3000/uploads/${photo.filename})`,
                    backgroundColor: photo.dominantColor || '#f3f4f6',
                  }}
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {isSelectionMode ? (
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPhotoIds.has(photo.id)
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'bg-white/20 border-white/70 hover:bg-white/30'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                      >
                        {selectedPhotoIds.has(photo.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-5 h-5 rounded-full border-2 border-white/70 hover:bg-white/20"></div>
                      </div>
                    )}
                  </div>
                  {!isSelectionMode && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table
            headers={[
              isSelectionMode ? (
                <input
                  key="select-all"
                  type="checkbox"
                  checked={selectedPhotoIds.size === photos.length && photos.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              ) : null,
              'Foto',
              'Título',
              'Tamanho',
              'Data de aquisição',
              'Cor predominante',
              'Ações',
            ].filter(Boolean)}
          >
            {photos.map((photo) => (
              <TableRow key={photo.id} className={selectedPhotoIds.has(photo.id) ? 'bg-indigo-50' : ''}>
                {isSelectionMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPhotoIds.has(photo.id)}
                      onChange={() => togglePhotoSelection(photo.id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div
                    className="w-16 h-16 bg-cover bg-center rounded cursor-pointer"
                    style={{
                      backgroundImage: photo.url
                        ? `url(${photo.url})`
                        : `url(http://localhost:3000/uploads/${photo.filename})`,
                      backgroundColor: photo.dominantColor || '#f3f4f6',
                    }}
                    onClick={() => {
                      if (!isSelectionMode) {
                        setSelectedPhoto(photo);
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">
                    {photo.title}
                  </div>
                  {photo.description && (
                    <div className="text-sm text-gray-500">
                      {photo.description}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatFileSize(photo.size)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(photo.acquisitionDate)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{
                        backgroundColor: photo.dominantColor || '#000000',
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      {photo.dominantColor}
                    </span>
                  </div>
                </TableCell>
                {!isSelectionMode && (
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Excluir
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </Table>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </main>

      {showUploadModal && id && (
        <UploadPhotoModal
          albumId={id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
          }}
        />
      )}

      {showEditModal && album && (
        <EditAlbumModal
          album={album}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
          }}
        />
      )}

      {showShareModal && (
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Compartilhar álbum"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {album?.isPublic
                ? 'Este álbum está público. Deseja torná-lo privado?'
                : 'Tornar este álbum público permitirá que qualquer pessoa com o link possa visualizá-lo.'}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowShareModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant={album?.isPublic ? 'danger' : 'primary'}
                onClick={async () => {
                  try {
                    await shareAlbumMutation.mutateAsync({
                      id: id || '',
                      isPublic: !album?.isPublic,
                    });
                    setShowShareModal(false);
                  } catch (error) {
                    setErrorMessage(
                      getErrorMessage(error) || 'Erro ao compartilhar álbum',
                    );
                  }
                }}
                isLoading={shareAlbumMutation.isPending}
              >
                {album?.isPublic ? 'Tornar privado' : 'Tornar público'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedPhoto && (
        <PhotoViewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={() => {
            handleDeletePhoto(selectedPhoto.id);
            setSelectedPhoto(null);
          }}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPhotoToDelete(null);
        }}
        onConfirm={confirmDeletePhoto}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AlbumDetail;
