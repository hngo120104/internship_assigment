import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { UserResponseDto } from '../../users/dto/users/response/user.response.dto';
// import { UserCartResponseDto } from '../../carts/dto/response/cart.response.dto';
import { CartItemsService } from '../../carts/services/cart-items.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  async banUser(userId: string): Promise<UserResponseDto> {
    return await this.usersService.banUser(userId);
  }

  // async findAllCartItemsOfUser(userId: string): Promise<UserCartResponseDto> {
  //   const userCartItems;
  // }
}
