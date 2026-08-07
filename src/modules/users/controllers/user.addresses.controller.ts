import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { UserAddressesService } from '../services/user.addresses.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserAddressesCreateDto } from '../dto/user.addresses/user.addresses.create.dto';
import { UserAddressesResponseDto } from '../dto/user.addresses/user.addresses.response.dto';
import { UserAddressesUpdateDto } from '../dto/user.addresses/user.addresses.update.dto';

@Controller('api/users/addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Post()
  async createNewUserAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userAddressesCreateDto: UserAddressesCreateDto,
  ): Promise<UserAddressesResponseDto> {
    return await this.userAddressesService.createNewUserAddress(
      user.sub,
      userAddressesCreateDto,
    );
  }

  @Patch(':addressId')
  async updateUserAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('addressId') addressId: string,
    @Body() userAddressesUpdateDto: UserAddressesUpdateDto,
  ): Promise<UserAddressesResponseDto> {
    return await this.userAddressesService.updateUserAddress(
      user.sub,
      addressId,
      userAddressesUpdateDto,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserAddresses(
    @CurrentUser() user: CurrentUserPayload,
    @Body() addressIds: string[],
  ): Promise<void> {
    await this.userAddressesService.deleteUserAddresses(user.sub, addressIds);
  }
}
