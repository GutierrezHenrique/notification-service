import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreatePhoto } from '../hooks/usePhotos';
import { getErrorMessage } from '../types/api';
import {
  Modal,
  Input,
  Textarea,
  Button,
  Alert,
  Dropzone,
} from '../components/ui';

interface UploadPhotoForm {
  title: string;
  description: string;
  acquisitionDate: string;
}

interface UploadPhotoModalProps {
  albumId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadPhotoModal = ({
  albumId,
  onClose,
  onSuccess,
}: UploadPhotoModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadPhotoForm>();

  const createPhotoMutation = useCreatePhoto(albumId);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadErrors, setUploadErrors] = useState<Map<number, string>>(new Map());

  // Delay between uploads to respect rate limit (15 uploads per minute = 4 seconds between each)
  const UPLOAD_DELAY_MS = 5000; // 5 seconds to be safe
  const MAX_RETRIES = 3;
  const RETRY_DELAY_BASE_MS = 5000; // 5 seconds base delay for retries

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const uploadWithRetry = async (
    file: File,
    index: number,
    data: UploadPhotoForm,
    retryCount = 0,
  ): Promise<void> => {
    try {
      await createPhotoMutation.mutateAsync({
        title: files.length > 1 ? file.name.split('.')[0] : data.title,
        description: data.description,
        acquisitionDate: data.acquisitionDate,
        file,
      });
      // Clear any previous error for this file
      setUploadErrors((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error) || 'Erro desconhecido';
      const isRateLimitError =
        errorMessage.toLowerCase().includes('too many requests') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        error?.response?.status === 429;

      if (isRateLimitError && retryCount < MAX_RETRIES) {
        // Calculate exponential backoff: 5s, 10s, 20s
        const retryDelay = RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
        setUploadStatus(
          `Rate limit atingido. Aguardando ${retryDelay / 1000}s antes de tentar novamente...`,
        );
        await sleep(retryDelay);
        return uploadWithRetry(file, index, data, retryCount + 1);
      } else {
        // Store error for this file
        setUploadErrors((prev) => {
          const newMap = new Map(prev);
          newMap.set(index, errorMessage);
          return newMap;
        });
        throw error;
      }
    }
  };

  const onSubmit = async (data: UploadPhotoForm) => {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setUploadErrors(new Map());
    setUploadStatus('');

    try {
      // Upload files sequentially with delay between each
      for (let i = 0; i < files.length; i++) {
        setCurrentUploadIndex(i + 1);
        const file = files[i];

        // Show status
        setUploadStatus(`Enviando foto ${i + 1} de ${files.length}: ${file.name}`);

        // Upload with retry logic
        await uploadWithRetry(file, i, data);

        // Add delay between uploads (except after the last one)
        if (i < files.length - 1) {
          setUploadStatus(
            `Aguardando ${UPLOAD_DELAY_MS / 1000}s antes do próximo upload...`,
          );
          await sleep(UPLOAD_DELAY_MS);
        }
      }

      setUploadStatus('Upload concluído com sucesso!');
      // Small delay to show success message
      await sleep(500);
      onSuccess();
    } catch (error) {
      // Errors are already stored in uploadErrors map
      setUploadStatus('Alguns uploads falharam. Verifique os erros abaixo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Adicionar fotos"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <UploadSection
          files={files}
          setFiles={setFiles}
        />

        {files.length > 0 && (
          <div className="space-y-4 animate__animated animate__fadeIn">
            {uploadStatus && (
              <Alert type={uploading ? 'info' : uploadErrors.size > 0 ? 'warning' : 'success'}>
                {uploadStatus}
              </Alert>
            )}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar">
              {files.map((file, idx) => {
                const error = uploadErrors.get(idx);
                const isCurrentUpload = uploading && currentUploadIndex === idx + 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0 ${error ? 'bg-red-50' : isCurrentUpload ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isCurrentUpload && !error && (
                        <svg
                          className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {error && (
                        <svg
                          className="w-4 h-4 text-red-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {!isCurrentUpload && !error && currentUploadIndex > idx + 1 && (
                        <svg
                          className="w-4 h-4 text-green-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      <span
                        className={`truncate flex-1 ${error ? 'text-red-700' : 'text-slate-700'
                          }`}
                        title={error ? error : file.name}
                      >
                        {file.name}
                      </span>
                    </div>
                    {error ? (
                      <span className="text-red-600 text-xs ml-2" title={error}>
                        Erro
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs ml-2">
                        {(file.size / 1024).toFixed(0)}kb
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {uploadErrors.size > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Erros de upload:</p>
                {Array.from(uploadErrors.entries()).map(([idx, error]) => (
                  <div key={idx} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <span className="font-medium">{files[idx].name}:</span> {error}
                  </div>
                ))}
              </div>
            )}

            {files.length === 1 && (
              <Input
                id="title"
                type="text"
                label="Título"
                placeholder="Ex: Pôr do sol na praia"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Título é obrigatório',
                })}
              />
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição opcional</label>
              </div>
              <Textarea
                id="description"
                label=""
                rows={2}
                placeholder={files.length > 1 ? "Descrição aplicada a todas as fotos" : "Descrição desta foto"}
                {...register('description')}
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label htmlFor="acquisitionDate" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Data das fotos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  id="acquisitionDate"
                  className="block w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white shadow-sm transition-shadow hover:shadow-md"
                  {...register('acquisitionDate')}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Se não informada, será usada a data de hoje.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={uploading}
                disabled={uploading}
                className="w-full"
              >
                {uploading
                  ? `Enviando ${currentUploadIndex} de ${files.length}...`
                  : `Enviar ${files.length} foto${files.length !== 1 ? 's' : ''}`
                }
              </Button>
              {files.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⏱️ Uploads serão feitos com intervalo para evitar rate limiting
                  (aproximadamente {Math.ceil(((files.length - 1) * UPLOAD_DELAY_MS) / 1000 / 60)} minuto{Math.ceil(((files.length - 1) * UPLOAD_DELAY_MS) / 1000 / 60) !== 1 ? 's' : ''})
                </p>
              )}
            </div>
          </div>
        )}

        {createPhotoMutation.isError && (
          <Alert type="error">
            {getErrorMessage(createPhotoMutation.error) ||
              'Erro ao enviar foto'}
          </Alert>
        )}
      </form>
    </Modal>
  );
};

// Helper component for clearer drag & drop code separation
const UploadSection = ({ files, setFiles }: { files: File[], setFiles: (f: File[]) => void }) => {
  return (
    <Dropzone
      onFileSelected={(selected) => {
        if (Array.isArray(selected)) {
          setFiles([...files, ...selected]); // Append files instead of replace
        } else if (selected) {
          setFiles([...files, selected]);
        }
      }}
      accept={{
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      }}
      maxFiles={20}
      multiple={true}
    />
  );
}

export default UploadPhotoModal;
