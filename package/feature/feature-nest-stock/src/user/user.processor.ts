import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { StockUser } from './user.schema';

@Injectable()
export class UserProcessor {
  constructor(private readonly userRepository: UserRepository) {}

  // @FIXME: 현재 사용하지 않음
  async registerUser(user: StockUser): Promise<void> {
    // return this.userRepository.create(user);
  }
}
