import { User } from '../../src/domain/entities/user.entity';

export const mockUser: User = new User({
  id: 'user-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

export const mockUsers: User[] = [
  mockUser,
  new User({
    id: 'user-456',
    email: 'test2@example.com',
    password: 'hashedPassword456',
    name: 'Test User 2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  }),
];
