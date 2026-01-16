import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export abstract class UsersRepository {
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findOneByEmail(email: string): Promise<User | null>;
  abstract findOneById(id: string): Promise<User | null>;
  abstract findOneByGoogleId(googleId: string): Promise<User | null>;
  abstract findOneByPasswordResetToken(token: string): Promise<User | null>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
