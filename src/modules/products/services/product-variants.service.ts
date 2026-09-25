import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductVariantCreateRequestDto } from '../dto/product-variants/request/product-variant-create.request.dto';
import { ProductVariantUpdateRequestDto } from '../dto/product-variants/request/product-variant-update.request.dto';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantsRepository } from '../repositories/product-variants.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { Transactional } from 'typeorm-transactional';
import { toResponseDto } from '../../../utils/response-dto.mapper';
import { ProductVariantResponseDto } from '../dto/product-variants/response/product-variant.response.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly productVariantsRepository: ProductVariantsRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async getVariantAvailableAmount(variantId: string): Promise<number> {
    const variant =
      await this.productVariantsRepository.findPurchasableProductVariantById(
        variantId,
      );
    if (!variant) {
      throw new NotFoundException('Variant not exists.');
    }
    return variant.amount;
  }

  async findActiveVariantsEntitiesByIds(
    variantIds: string[],
  ): Promise<ProductVariant[]> {
    const foundVariants =
      await this.productVariantsRepository.findActiveVariantsByIds(variantIds);
    return foundVariants;
  }

  async findPurchasableVariantEntityByIdOrThrow(
    variantId: string,
  ): Promise<ProductVariant> {
    const foundVariant =
      await this.productVariantsRepository.findPurchasableProductVariantById(
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
      await this.productVariantsRepository.findPurchasableProductVariantsByIds(
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
      await this.productVariantsRepository.findActiveVariantByIdAndAndProductIdAndLockForUpdate(
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

  private async validateProductOfShop(
    shopId: string,
    productId: string,
  ): Promise<Product> {
    const product = await this.productsRepository.findProductByIdAndShopId(
      productId,
      shopId,
    );
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  @Transactional()
  async createProductVariants(
    productId: string,
    variantCreateDtos: ProductVariantCreateRequestDto[],
    shopId?: string,
  ): Promise<ProductVariant[]> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
    }
    this.validateProductVariantCreateRequestNotEmpty(variantCreateDtos);

    const product = await this.validateProductOfShop(productId, shopId);

    await this.validateVariantsDoNotAlreadyExist(product.id, variantCreateDtos);
    return this.productVariantsRepository.createVariants(
      product.id,
      variantCreateDtos,
    );
  }

  @Transactional()
  async updateProductVariant(
    variantId: string,
    productId: string,
    variantUpdateDto: ProductVariantUpdateRequestDto,
    shopId?: string,
  ): Promise<ProductVariantResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
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
    await this.productVariantsRepository.save(variant);
    return toResponseDto(ProductVariantResponseDto, variant);
  }

  private async validateVariantOfProductOfShop(
    shopId: string,
    variant: ProductVariant,
  ) {
    const product = await this.productsRepository.findActiveProductByVariantId(
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
      throw new UnauthorizedException('User account is not a seller.');
    }
    const foundVariant =
      await this.productVariantsRepository.findVariantByIdAndProductIdAndShopId(
        variantId,
        shopId,
        productId,
      );
    if (!foundVariant) {
      throw new NotFoundException(
        'Product does not have this variant or shop does not have this product variant.',
      );
    }
    const deletedCount =
      await this.productVariantsRepository.softDelete(variantId);
    if (deletedCount !== 1) {
      throw new NotFoundException('Product variant not found or deleted.');
    }
    return deletedCount;
  }

  @Transactional()
  async validateAndRestockVariantQuantity(
    variantId: string,
    quantity: number,
  ): Promise<ProductVariant> {
    const restockResult =
      await this.productVariantsRepository.restockVariantAmountByAtomically(
        variantId,
        quantity,
      );
    if (restockResult !== 1)
      throw new NotFoundException(
        'Product variant not found or might already be restocked.',
      );
    return this.findPurchasableVariantEntityByIdOrThrow(variantId);
  }

  @Transactional()
  async reserveVariantsAmountAtomicallyOrThrow(
    reservationRequests: {
      variantId: string;
      amount: number;
    }[],
  ): Promise<number> {
    const sortedReservationRequests = [...reservationRequests].sort((l, r) =>
      l.variantId.localeCompare(r.variantId),
    );

    const reservationResult =
      await this.productVariantsRepository.reserveVariantsAmountByVariantIdsAtomically(
        sortedReservationRequests,
      );

    if (reservationResult !== sortedReservationRequests.length) {
      throw new Error('Atomic database inventory reservation failed.');
    }
    return reservationResult;
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
      await this.productVariantsRepository.findAllProductVariantByProductId(
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
}
