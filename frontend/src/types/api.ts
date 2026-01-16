import { AxiosError } from 'axios';

export interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
}
