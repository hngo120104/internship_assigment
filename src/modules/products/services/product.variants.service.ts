import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductVariantCreateRequestDto } from '../dto/product.variants/request/product.variant.create.request.dto';
import { ProductVariantUpdateRequestDto } from '../dto/product.variants/request/product.variant.update.request.dto';
import { ProductVariant } from '../entities/product.variant.entity';
import { ProductVariantsRepository } from '../repositories/product.variants.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { Transactional } from 'typeorm-transactional';
import { UserShopService } from '../../users/services/user.shop.service';
import { toResponseDto } from '../../../utils/to.dto.response';
import { ProductVariantResponseDto } from '../dto/product.variants/response/product.variant.response.dto';
import { UserShopRepository } from '../../users/repositories/user.shop.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly userShopsService: UserShopService,
    private readonly productVariantsRepo: ProductVariantsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly userShopRepo: UserShopRepository,
  ) {}

  async findActiveVariantsEntitiesByIds(
    variantIds: string[],
  ): Promise<ProductVariant[]> {
    const foundVariants =
      await this.productVariantsRepo.findActiveVariantsByIds(variantIds);
    return foundVariants;
  }

  async findPurchasableVariantEntityByIdOrThrow(
    variantId: string,
  ): Promise<ProductVariant> {
    const foundVariant =
      await this.productVariantsRepo.findPurchasableProductVariantById(
        variantId,
      );
    if (!foundVariant)
      throw new NotFoundException('Product variant not found.');
    return foundVariant;
  }

  async findPurchasableVariantsEntitiesByIdsOrThrow(
    variantIds: string[],
    expectedCount: number,
  ): Promise<ProductVariant[]> {
    const foundVariants =
      await this.productVariantsRepo.findPurchasableProductVariantsByIds(
        variantIds,
      );
    if (foundVariants.length !== expectedCount) {
      throw new NotFoundException('One or more of product variants not found.');
    }
    return foundVariants;
  }

  private async findActiveVariantEntityByIdAndProductIdAndLockForUpdateOrThrow(
    variantId: string,
    productId: string,
  ): Promise<ProductVariant> {
    const foundLockedVariant =
      await this.productVariantsRepo.findActiveVariantByIdAndAndProductIdAndLockForUpdate(
        variantId,
        productId,
      );
    if (!foundLockedVariant)
      throw new NotFoundException('Product variant not found.');
    return foundLockedVariant;
  }

  private validateProductVariantCreateRequestNotEmpty(
    variantCreateDtos: ProductVariantCreateRequestDto[],
  ): void {
    if (!variantCreateDtos) {
      throw new BadRequestException('Product variants cannot be empty.');
    }
  }

  @Transactional()
  async createProductVariants(
    productId: string,
    variantCreateDtos: ProductVariantCreateRequestDto[],
    shopId?: string,
  ): Promise<ProductVariant[]> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    this.validateProductVariantCreateRequestNotEmpty(variantCreateDtos);
    this.validateVariantSizeAndColorAreUnique(variantCreateDtos);
    const product = await this.validateShopExistsAndHasProduct(
      shopId,
      productId,
    );
    await this.validateVariantsDoNotAlreadyExist(productId, variantCreateDtos);
    return this.productVariantsRepo.createVariants(
      product.id,
      variantCreateDtos,
    );
  }

  private async validateShopExistsAndHasProduct(
    shopId: string,
    productId: string,
  ): Promise<Product> {
    const product = await this.productsRepo.findProductByIdAndShopId(
      productId,
      shopId,
    );
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  @Transactional()
  async updateProductVariant(
    variantId: string,
    productId: string,
    variantUpdateDto: ProductVariantUpdateRequestDto,
    shopId?: string,
  ): Promise<ProductVariantResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const variant =
      await this.findActiveVariantEntityByIdAndProductIdAndLockForUpdateOrThrow(
        variantId,
        productId,
      );
    await this.validateVariantOfProductOfShop(shopId, variant);
    const setKeysOfSizeAndColor = {
      size: variantUpdateDto.size ?? variant.size,
      color: variantUpdateDto.color ?? variant.color,
    };
    await this.validateVariantsDoNotAlreadyExist(
      variant.productId,
      [setKeysOfSizeAndColor],
      variant.id,
    );

    Object.assign(variant, variantUpdateDto);
    if (variantUpdateDto.color !== undefined) {
      variant.color = variantUpdateDto.color.trim();
    }
    await this.productVariantsRepo.save(variant);
    return toResponseDto(ProductVariantResponseDto, variant);
  }

  private async validateVariantOfProductOfShop(
    shopId: string,
    variant: ProductVariant,
  ) {
    const product = await this.productsRepo.findActiveProductByVariantId(
      variant.id,
    );
    if (!product) {
      throw new NotFoundException('Product of variant not found.');
    }
    if (product.shopId !== shopId) {
      throw new NotFoundException('Product does not belong to shop.');
    }
  }

  async softDeleteProductVariantOrThrow(
    variantId: string,
    productId: string,
    shopId?: string,
  ): Promise<number> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const foundVariant =
      await this.productVariantsRepo.findVariantByIdAndProductIdAndShopId(
        variantId,
        shopId,
        productId,
      );
    if (!foundVariant) {
      throw new NotFoundException(
        'Product does not have this variant or shop does not have this product variant.',
      );
    }
    const deletedCount = await this.productVariantsRepo.softDelete(variantId);
    if (deletedCount !== 1) {
      throw new NotFoundException('Product variant not found or deleted.');
    }
    return deletedCount;
  }

  async validateVariantQuantity(
    variantId: string,
    quantity: number,
  ): Promise<void> {
    this.validateRequestedQuantityIsPositiveInteger(quantity);
    const variantToValidate =
      await this.findPurchasableVariantEntityByIdOrThrow(variantId);
    this.validateVariantHasSufficientStock(variantToValidate, quantity);
  }

  @Transactional()
  async validateAndRestockVariantQuantity(
    variantId: string,
    quantity: number,
  ): Promise<ProductVariant> {
    const restockResult =
      await this.productVariantsRepo.restockVariantAmountByAtomically(
        variantId,
        quantity,
      );
    if (restockResult !== 1)
      throw new NotFoundException(
        'Product variant not found or might already be restocked.',
      );
    return this.findPurchasableVariantEntityByIdOrThrow(variantId);
  }

  async validateAndReserveVariantsAmountOrThrow(
    variantItems: {
      variant: ProductVariant;
      quantity: number;
    }[],
  ): Promise<ProductVariant[]> {
    for (const item of variantItems) {
      this.validateVariantHasSufficientStock(item.variant, item.quantity);
      await this.validateVariantQuantity(item.variant.id, item.quantity);
    }

    const reservedResult =
      await this.productVariantsRepo.reserveVariantsAmountByVariantIdsAtomically(
        variantItems.map((item) => {
          return {
            variantId: item.variant.id,
            quantity: item.quantity,
          };
        }),
      );
    if (reservedResult !== variantItems.length)
      throw new NotFoundException('Product variant not found.');
    return await this.findActiveVariantsEntitiesByIds(
      variantItems.map((item) => item.variant.id),
    );
  }

  private validateVariantSizeAndColorAreUnique(
    variants: Array<Pick<ProductVariantCreateRequestDto, 'size' | 'color'>>,
  ): void {
    const keys = variants.map((variant) => this.toSizeColorKey(variant));
    if (new Set(keys).size !== keys.length) {
      throw new ConflictException('Product variants cannot be duplicated.');
    }
  }

  private async validateVariantsDoNotAlreadyExist(
    productId: string,
    variants: Array<Pick<ProductVariantCreateRequestDto, 'size' | 'color'>>,
    ignoredVariantId?: string,
  ): Promise<void> {
    const requestedKeys = new Set(
      variants.map((variant) => this.toSizeColorKey(variant)),
    );
    const existingVariants =
      await this.productVariantsRepo.findAllProductVariantByProductId(
        productId,
      );
    const hasConflict = existingVariants.some(
      (variant) =>
        variant.id !== ignoredVariantId &&
        requestedKeys.has(this.toSizeColorKey(variant)),
    );
    if (hasConflict) {
      throw new ConflictException('Product variant already exists.');
    }
  }

  private toSizeColorKey(
    variant: Pick<ProductVariantCreateRequestDto, 'size' | 'color'>,
  ): string {
    return `${variant.size ?? ''}:${variant.color?.trim().toLowerCase() ?? ''}`;
  }

  private validateRequestedQuantityIsPositiveInteger(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException(
        'Product quantity must be a positive integer.',
      );
    }
  }

  private validateVariantHasSufficientStock(
    variant: ProductVariant,
    requestedQuantity: number,
  ) {
    if (variant.amount < requestedQuantity) {
      throw new BadRequestException(
        `Your amount: ${requestedQuantity}. Product variant amount is not enough: ${variant.amount}`,
      );
    }
  }
}
