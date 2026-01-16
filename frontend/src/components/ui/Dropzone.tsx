import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onFileSelected: (file: File | File[] | null) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

export const Dropzone = ({
  onFileSelected,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  },
  maxFiles = 1,
  multiple = false,
  className = '',
}: DropzoneProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (multiple || maxFiles > 1) {
          setSelectedFiles(acceptedFiles);
          onFileSelected(acceptedFiles);
        } else {
          const file = acceptedFiles[0];
          setSelectedFiles([file]);
          onFileSelected(file);
        }
      }
    },
    [onFileSelected, multiple, maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-400'
      } ${className}`}
    >
      <input {...getInputProps()} />
      {selectedFiles.length > 0 ? (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            {selectedFiles.length === 1
              ? 'Arquivo selecionado:'
              : `${selectedFiles.length} arquivos selecionados:`}
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-medium text-gray-800 text-sm truncate flex-1">
                  {file.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                    setSelectedFiles(newFiles);
                    if (multiple || maxFiles > 1) {
                      onFileSelected(newFiles);
                    } else {
                      onFileSelected(newFiles[0] || ([] as File[]));
                    }
                  }}
                  className="ml-2 text-sm text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFiles([]);
              if (multiple || maxFiles > 1) {
                onFileSelected([]);
              } else {
                onFileSelected([] as File[]);
              }
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Remover todos
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-600">
            {isDragActive
              ? 'Solte o(s) arquivo(s) aqui...'
              : multiple
                ? 'Arraste e solte imagens aqui, ou clique para selecionar'
                : 'Arraste e solte uma imagem aqui, ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Formatos aceitos: JPEG, PNG, GIF, WEBP
            {multiple && maxFiles > 1 && ` (máximo ${maxFiles} arquivos)`}
          </p>
        </div>
      )}
    </div>
  );
};
