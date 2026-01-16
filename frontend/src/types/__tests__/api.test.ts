import { getErrorMessage } from '../api';
import { AxiosError } from 'axios';

describe('getErrorMessage', () => {
  it('should return message from axios error response', () => {
    const error = {
      response: {
        data: {
          message: 'Custom error message',
        },
      },
    } as unknown as AxiosError<{ message: string }>;

    expect(getErrorMessage(error)).toBe('Custom error message');
  });

  it('should return error message from Error instance', () => {
    const error = new Error('Standard error message');
    expect(getErrorMessage(error)).toBe('Standard error message');
  });

  it('should return default message for unknown error', () => {
    const error = 'String error';
    expect(getErrorMessage(error)).toBe('Ocorreu um erro inesperado');
  });

  it('should handle error without response data', () => {
    const error = new Error('Network error');

    expect(getErrorMessage(error)).toBe('Network error');
  });
});
