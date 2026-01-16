import { User } from '../../domain/entities/user.entity';

export abstract class AuthRepository {
  abstract findOneByEmail(email: string): Promise<User | null>;
}
