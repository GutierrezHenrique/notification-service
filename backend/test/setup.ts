// Global test setup
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock sharp
jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    stats: jest.fn().mockResolvedValue({
      channels: [{ mean: 255 }, { mean: 128 }, { mean: 64 }],
    }),
  })),
}));

// Mock exif-parser
jest.mock('exif-parser', () => ({
  create: jest.fn().mockReturnValue({
    parse: jest.fn().mockReturnValue({
      tags: {
        DateTimeOriginal: 1609459200,
      },
    }),
  }),
}));

// Increase timeout for async tests
jest.setTimeout(10000);
