import { Body, Controller, Param, Patch, Post, Delete } from '@nestjs/common';
import { UserAddressesService } from '../services/user.addresses.service';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { UserAddressCreateRequestDto } from '../dto/user.addresses/request/user.address.create.request.dto';
import { UserAddressResponseDto } from '../dto/user.addresses/response/user.address.reponse.dto';
import { UserAddressUpdateRequestDto } from '../dto/user.addresses/request/user.address.update.request.dto';
import { UserAddressesDeleteRequestDto } from '../dto/user.addresses/request/user.addresses.delete.request.dto';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';

@Controller('users/addresses')
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
  async deleteUserAddresses(
    @CurrentUser() user: CurrentUserPayload,
    @Body() requestDto: UserAddressesDeleteRequestDto,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount =
      await this.userAddressesService.deleteUserAddressesOrThrow(
        user.sub,
        requestDto.addressIds,
      );
    return new DeleteCountResponseDto(deletedCount);
  }
}
