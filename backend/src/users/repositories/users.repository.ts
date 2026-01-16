import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export abstract class UsersRepository {
  abstract create(createUserDto: CreateUserDto): Promise<User>;
  abstract findOneByEmail(email: string): Promise<User | null>;
  abstract findOneById(id: string): Promise<User | null>;
}
