import { BadRequestException } from '@nestjs/common';

/**
 * Validates UUID format
 */
export function validateUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates share token format (64 hex characters)
 */
export function validateShareToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // Share tokens are 64 hex characters (32 bytes in hex)
  const tokenRegex = /^[a-f0-9]{64}$/i;
  return tokenRegex.test(token);
}

/**
 * Validates and throws if UUID is invalid
 */
export function assertValidUUID(id: string, fieldName = 'ID'): void {
  if (!validateUUID(id)) {
    throw new BadRequestException(`Invalid ${fieldName} format`);
  }
}

/**
 * Validates and throws if share token is invalid
 */
export function assertValidShareToken(token: string): void {
  if (!validateShareToken(token)) {
    throw new BadRequestException('Invalid share token format');
  }
}

/**
 * Validates string length
 */
export function validateStringLength(
  input: string,
  min: number,
  max: number,
): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  const length = input.length;
  return length >= min && length <= max;
}

/**
 * Validates payload size (in bytes)
 */
export function validatePayloadSize(
  payload: any,
  maxSizeBytes: number,
): boolean {
  try {
    const jsonString = JSON.stringify(payload);
    const sizeBytes = Buffer.byteLength(jsonString, 'utf8');
    return sizeBytes <= maxSizeBytes;
  } catch {
    return false;
  }
}

/**
 * Validates email format more strictly
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') {
    return false;
  }
  // RFC 5322 compliant regex (simplified)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates URL format
 */
export function validateURL(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Prevents timing attacks by using constant-time comparison
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
