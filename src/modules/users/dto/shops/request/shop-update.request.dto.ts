import { PartialType } from '@nestjs/mapped-types';
import { ShopCreateRequestDto } from './shop-create.request.dto';

export class ShopUpdateRequestDto extends PartialType(ShopCreateRequestDto) {}
