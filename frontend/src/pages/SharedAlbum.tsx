import { useParams } from 'react-router-dom';
import { useSharedAlbum } from '../hooks/useAlbums';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Loading,
  EmptyState,
  Button,
  Table,
  TableRow,
  TableCell,
} from '../components/ui';
import PhotoViewModal from '../components/PhotoViewModal';
import { Photo } from '../types/photo';
import { useState, useMemo } from 'react';

const SharedAlbum = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: album, isLoading: albumLoading, error } = useSharedAlbum(
    shareToken || '',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'thumbnails' | 'table'>('thumbnails');

  // Sort photos by acquisition date
  const photos = useMemo(() => {
    if (!album?.photos) return [];
    const sorted = [...album.photos].sort((a, b) => {
      const dateA = a.acquisitionDate
        ? new Date(a.acquisitionDate).getTime()
        : 0;
      const dateB = b.acquisitionDate
        ? new Date(b.acquisitionDate).getTime()
        : 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [album?.photos, sortOrder]);

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

  if (albumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Álbum não encontrado
          </h1>
          <p className="text-gray-600 mb-4">
            O link de compartilhamento é inválido ou o álbum não está mais
            público.
          </p>
          <Button onClick={() => (window.location.href = '/login')}>
            Fazer login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-product-sans font-medium text-gray-700 tracking-tight">MyGallery</span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => (window.location.href = '/login')} variant="outline" size="sm">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-medium uppercase tracking-wide">Álbum Compartilhado</span>
              </div>
              <h2 className="text-4xl font-normal text-gray-900 tracking-tight mb-2">
                {album.title}
              </h2>
              <p className="text-gray-500 text-lg font-light">
                {album.description || 'Sem descrição'} • {photos.length} fotos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title="Ordenar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="Nenhuma foto neste álbum"
            description="Este álbum ainda não possui fotos"
          />
        ) : viewMode === 'thumbnails' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
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
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table
            headers={[
              'Foto',
              'Título',
              'Tamanho',
              'Data de aquisição',
              'Cor predominante',
            ]}
          >
            {photos.map((photo) => (
              <TableRow key={photo.id}>
                <TableCell>
                  <div
                    className="w-16 h-16 bg-cover bg-center rounded cursor-pointer"
                    style={{
                      backgroundImage: photo.url
                        ? `url(${photo.url})`
                        : `url(http://localhost:3000/uploads/${photo.filename})`,
                      backgroundColor: photo.dominantColor || '#f3f4f6',
                    }}
                    onClick={() => setSelectedPhoto(photo)}
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
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{
                        backgroundColor: photo.dominantColor || '#000000',
                      }}
                    />
                    <span className="text-sm text-gray-700 font-mono">
                      {photo.dominantColor || 'N/A'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </main>

      {selectedPhoto && (
        <PhotoViewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default SharedAlbum;
