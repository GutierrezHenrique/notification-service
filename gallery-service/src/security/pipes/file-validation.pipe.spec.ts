import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from './file-validation.pipe';

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    pipe = new FileValidationPipe(10 * 1024 * 1024, [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]);
  });

  it('should validate a valid JPEG file', () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
    } as Express.Multer.File;

    const result = pipe.transform(file);
    expect(result).toBe(file);
  });

  it('should validate a valid PNG file', () => {
    const file = {
      originalname: 'test.png',
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    } as Express.Multer.File;

    const result = pipe.transform(file);
    expect(result).toBe(file);
  });

  it('should validate a valid GIF file', () => {
    const file = {
      originalname: 'test.gif',
      mimetype: 'image/gif',
      size: 1024,
      buffer: Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
    } as Express.Multer.File;

    const result = pipe.transform(file);
    expect(result).toBe(file);
  });

  it('should validate a valid WebP file', () => {
    const file = {
      originalname: 'test.webp',
      mimetype: 'image/webp',
      size: 1024,
      buffer: Buffer.from('RIFF    WEBP'),
    } as Express.Multer.File;

    const result = pipe.transform(file);
    expect(result).toBe(file);
  });

  it('should throw BadRequestException if file is missing', () => {
    expect(() => pipe.transform(undefined as any)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if file size exceeds limit', () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 11 * 1024 * 1024, // 11MB
      buffer: Buffer.from([0xff, 0xd8, 0xff]),
    } as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid MIME type', () => {
    const file = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid file extension', () => {
    const file = {
      originalname: 'test.exe',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from([0xff, 0xd8, 0xff]),
    } as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if file signature does not match MIME type', () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]), // PNG signature but JPEG MIME
    } as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if file is too small', () => {
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from([0xff]), // Too small
    } as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });
});
