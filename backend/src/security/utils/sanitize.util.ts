import { Transform } from 'class-transformer';

/**
 * Sanitizes string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:text\/html/gi, '') // Remove data URIs with HTML
    .replace(/vbscript:/gi, '') // Remove VBScript protocol
    .replace(/file:/gi, '') // Remove file protocol
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .substring(0, 10000); // Limit length
}

/**
 * Sanitizes file path to prevent directory traversal
 */
export function sanitizeFilePath(filePath: string): string {
  if (typeof filePath !== 'string') {
    return '';
  }

  // Remove path traversal attempts
  return filePath
    .replace(/\.\./g, '') // Remove ..
    .replace(/\/\//g, '/') // Remove double slashes
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/[^a-zA-Z0-9._/-]/g, ''); // Remove dangerous characters
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return email;
  }

  return email.trim().toLowerCase().substring(0, 255);
}

/**
 * Sanitizes URL input
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return url;
  }

  // Only allow http, https protocols
  const trimmed = url.trim();
  if (!trimmed.match(/^https?:\/\//i)) {
    return '';
  }

  return trimmed.substring(0, 2048);
}

/**
 * Transform decorator for sanitizing strings
 */
export const Sanitize = () =>
  Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item,
      );
    }
    return value;
  });
