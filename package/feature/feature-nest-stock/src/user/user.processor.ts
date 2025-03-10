import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { StockUser } from './user.schema';

@Injectable()
export class UserProcessor {
  constructor(private readonly userRepository: UserRepository) {}

  async registerUser(user: StockUser): Promise<void> {
    return this.userRepository.create(user);
  }
}
