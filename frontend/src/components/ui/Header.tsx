import { ReactNode, useState, FormEvent, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserMenu } from './UserMenu';
import { useSearchPhotos } from '../../hooks/usePhotos';
import { Photo } from '../../types/photo';

interface HeaderProps {
  title?: string;
  rightContent?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showUserMenu?: boolean;
}

export const Header = ({
  title = "MyGallery",
  rightContent,
  showBackButton = false,
  onBack,
  showUserMenu = true,
}: HeaderProps) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Busca em tempo real
  const { data: searchResults, isLoading: isSearching } = useSearchPhotos(
    debouncedQuery,
    'desc',
    1,
    5, // Limitar a 5 resultados no dropdown
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mostrar resultados quando houver query e estiver focado
  useEffect(() => {
    if (isFocused && debouncedQuery.trim().length >= 2 && searchResults) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [isFocused, debouncedQuery, searchResults]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query.length >= 2) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setShowResults(false);
    setSearchQuery('');
    // Navegar para o álbum da foto
    navigate(`/albums/${photo.albumId}`);
  };

  const handleViewAll = () => {
    if (searchQuery.trim().length >= 2) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const photos = searchResults?.photos || [];
  const hasMoreResults = (searchResults?.total || 0) > 5;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-[200px]">
          {showBackButton && onBack ? (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              title="Voltar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          ) : (
            <Link to="/albums" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-product-sans font-medium text-gray-700 tracking-tight">{title}</span>
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex-1 max-w-2xl hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Delay para permitir cliques nos resultados
                  setTimeout(() => setIsFocused(false), 200);
                }}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-100 border-none rounded-lg leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:shadow-md transition-all sm:text-sm"
                placeholder="Pesquisar em suas fotos"
              />
              
              {/* Dropdown de resultados */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {photos.length > 0 ? (
                    <>
                      <div className="p-2">
                        {photos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => handlePhotoClick(photo)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                          >
                            <div
                              className="w-12 h-12 bg-cover bg-center rounded-md flex-shrink-0"
                              style={{
                                backgroundImage: photo.url
                                  ? `url(${photo.url})`
                                  : `url(http://localhost:3000/uploads/${photo.filename})`,
                                backgroundColor: photo.dominantColor || '#f3f4f6',
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                {photo.title}
                              </p>
                              {photo.description && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {photo.description}
                                </p>
                              )}
                            </div>
                            <svg className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                      {hasMoreResults && (
                        <div className="border-t border-gray-200 p-2">
                          <button
                            onClick={handleViewAll}
                            className="w-full text-center px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            Ver todos os resultados ({searchResults?.total} foto{searchResults && searchResults.total !== 1 ? 's' : ''})
                          </button>
                        </div>
                      )}
                    </>
                  ) : debouncedQuery.trim().length >= 2 && !isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhuma foto encontrada para "{debouncedQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </form>
          </div>
        )}

        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          {rightContent}
          {showUserMenu && isAuthenticated && <UserMenu />}
        </div>
      </div>
    </header>
  );
};
