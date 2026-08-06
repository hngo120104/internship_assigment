import { Body, Controller, Patch } from '@nestjs/common';
import { UserShopService } from '../services/user.shop.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserShopUpdateDto } from '../dto/user.shop/user.shop.update.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';

@Controller('api/shops')
export class ShopsController {
  constructor(private readonly userShopService: UserShopService) {}

  @Patch('me')
  @Roles(Role.SELLER)
  async updateShopDetails(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userShopUpdateDto: UserShopUpdateDto,
  ) {
    return await this.userShopService.updateShopDetails(
      user.sub,
      userShopUpdateDto,
    );
  }
}
