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
import { UserAddressCreateRequestDto } from '../dto/user.addresses/request/user.address.create.request.dto';
import { UserAddressResponseDto } from '../dto/user.addresses/response/user.address.reponse.dto';
import { UserAddressUpdateRequestDto } from '../dto/user.addresses/request/user.address.update.request.dto';

@Controller('api/users/addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Post()
  async createNewUserAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Body() userAddressesCreateDto: UserAddressCreateRequestDto,
  ): Promise<UserAddressResponseDto> {
    return await this.userAddressesService.createNewUserAddress(
      user.sub,
      userAddressesCreateDto,
    );
  }

  @Patch(':addressId')
  async updateUserAddress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('addressId') addressId: string,
    @Body() userAddressesUpdateDto: UserAddressUpdateRequestDto,
  ): Promise<UserAddressResponseDto> {
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
    await this.userAddressesService.deleteUserAddressesOrThrow(
      user.sub,
      addressIds,
    );
  }
}
