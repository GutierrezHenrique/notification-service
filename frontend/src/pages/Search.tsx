import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchPhotos } from '../hooks/usePhotos';
import PhotoViewModal from '../components/PhotoViewModal';
import { Photo } from '../types/photo';
import {
  Header,
  Button,
  Loading,
  EmptyState,
  Table,
  TableRow,
  TableCell,
} from '../components/ui';

type ViewMode = 'thumbnails' | 'table';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const query = searchParams.get('q') || '';
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { data: photosData, isLoading: photosLoading } = useSearchPhotos(
    query,
    sortOrder,
    currentPage,
    pageSize,
  );
  const photos = photosData?.photos || [];
  const totalPhotos = photosData?.total || 0;
  const totalPages = Math.ceil(totalPhotos / pageSize);
  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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

  if (!query || query.trim().length < 2) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title="Pesquisar fotos"
          rightContent={
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                Olá, {user?.name}
              </span>
              <Button
                variant="outline"
                onClick={logout}
                className="!py-1 !px-3 text-xs"
              >
                Sair
              </Button>
            </div>
          }
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            title="Digite um termo de busca"
            description="Use a barra de pesquisa no topo para buscar suas fotos por título, descrição ou nome do arquivo."
          />
        </main>
      </div>
    );
  }

  if (photosLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title="Pesquisar fotos"
          rightContent={
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                Olá, {user?.name}
              </span>
              <Button
                variant="outline"
                onClick={logout}
                className="!py-1 !px-3 text-xs"
              >
                Sair
              </Button>
            </div>
          }
        />
        <Loading fullScreen text="Buscando fotos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Pesquisar fotos"
        rightContent={
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              Olá, {user?.name}
            </span>
            <Button
              variant="outline"
              onClick={logout}
              className="!py-1 !px-3 text-xs"
            >
              Sair
            </Button>
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate__animated animate__fadeIn">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Resultados da busca
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {totalPhotos === 0
                ? 'Nenhuma foto encontrada'
                : `${totalPhotos} foto${totalPhotos !== 1 ? 's' : ''} encontrada${totalPhotos !== 1 ? 's' : ''} para "${query}"`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'thumbnails' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('thumbnails')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Miniaturas
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Tabela
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  Mais recentes
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  Mais antigas
                </>
              )}
            </Button>
          </div>
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="Nenhuma foto encontrada"
            description={`Não encontramos fotos que correspondam a "${query}". Tente usar outros termos de busca.`}
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
                    {photo.albumId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/albums/${photo.albumId}`);
                        }}
                        className="text-white/80 text-xs hover:text-white mt-1"
                      >
                        Ver álbum
                      </button>
                    )}
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
              'Álbum',
              'Tamanho',
              'Data de aquisição',
              'Ações',
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
                <TableCell>
                  {photo.albumId ? (
                    <button
                      onClick={() => navigate(`/albums/${photo.albumId}`)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Ver álbum
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatFileSize(photo.size)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(photo.acquisitionDate)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                  >
                    Ver
                  </button>
                </TableCell>
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}

        {selectedPhoto && (
          <PhotoViewModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Search;
