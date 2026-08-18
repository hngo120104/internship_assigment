import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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

  private async findVariantEntityByIdOrThrow(
    variantId: string,
    productId: string,
  ): Promise<ProductVariant> {
    const foundVariant =
      await this.productVariantsRepo.findVariantByIdAndProductId(
        variantId,
        productId,
      );
    if (!foundVariant)
      throw new NotFoundException('Product variant not found.');
    return foundVariant;
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
  ): Promise<ProductVariant[]> {
    const foundVariants =
      await this.productVariantsRepo.findPurchasableProductVariantsByIds(
        variantIds,
      );
    if (!foundVariants.length) {
      throw new NotFoundException('Product variant not found.');
    }
    return foundVariants;
  }

  private async findActiveVariantEntityByIdAndProductIdOrThrow(
    variantId: string,
    productId: string,
  ): Promise<ProductVariant> {
    const variant =
      await this.productVariantsRepo.findPurchasableProductVariantByIdAndProductId(
        variantId,
        productId,
      );
    if (!variant) throw new NotFoundException('Product variant not found.');
    return variant;
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

  @Transactional()
  async createProductVariants(
    userId: string,
    productId: string,
    variantCreateDtos: ProductVariantCreateRequestDto[],
  ): Promise<ProductVariant[]> {
    this.validateVariantListNotEmpty(variantCreateDtos);
    this.validateVariantSizeAndColorAreUnique(variantCreateDtos);
    const product = await this.validateShopExistsAndHasProduct(
      userId,
      productId,
    );
    await this.validateVariantsDoNotAlreadyExist(productId, variantCreateDtos);
    return this.productVariantsRepo.createVariants(
      product.id,
      variantCreateDtos,
    );
  }

  private async validateShopExistsAndHasProduct(
    userId: string,
    productId: string,
  ): Promise<Product> {
    const userShop = await this.userShopRepo.findActiveShopByUserId(userId);
    if (!userShop) {
      throw new NotFoundException('User shop not found.');
    }
    const product = await this.productsRepo.findProductByIdAndShopId(
      productId,
      userShop.id,
    );
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  @Transactional()
  async updateProductVariant(
    userId: string,
    variantId: string,
    productId: string,
    variantUpdateDto: ProductVariantUpdateRequestDto,
  ): Promise<ProductVariantResponseDto> {
    const variant =
      await this.findActiveVariantEntityByIdAndProductIdAndLockForUpdateOrThrow(
        variantId,
        productId,
      );
    await this.validateVariantOfProductOfShop(userId, variant);
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
    userId: string,
    variant: ProductVariant,
  ) {
    const userShop = await this.userShopRepo.findActiveShopByUserId(userId);
    const product = await this.productsRepo.findActiveProductByVariantId(
      variant.id,
    );
    if (!userShop) {
      throw new NotFoundException('User shop not found.');
    }
    if (!product) {
      throw new NotFoundException('Product of variant not found.');
    }
    if (product.shopId !== userShop.id) {
      throw new NotFoundException('Product does not belong to shop.');
    }
  }

  async softDeleteProductVariantOrThrow(
    userId: string,
    variantId: string,
    productId: string,
  ): Promise<number> {
    const shop =
      await this.userShopsService.findShopEntityByUserIdOrThrow(userId);
    const foundVariant =
      await this.productVariantsRepo.findVariantByIdAndProductIdAndShopId(
        variantId,
        shop.id,
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
    const variant =
      await this.findPurchasableVariantEntityByIdOrThrow(variantId);
    this.validateRequestedQuantityIsPositiveInteger(quantity);
    this.validateVariantHasSufficientStock(variant, quantity);
  }

  @Transactional()
  async validateAndRestockVariantQuantity(
    variantId: string,
    productId: string,
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
    return this.findActiveVariantEntityByIdAndProductIdOrThrow(
      variantId,
      productId,
    );
  }

  async validateAndReserveVariantStockOrThrow(
    variant: ProductVariant,
    quantity: number,
  ): Promise<ProductVariant> {
    this.validateRequestedQuantityIsPositiveInteger(quantity);
    this.validateVariantHasSufficientStock(variant, quantity);
    const reservedResult =
      await this.productVariantsRepo.reserveVariantAmountByProductIdAndVariantIdAtomically(
        variant.id,
        variant.productId,
        quantity,
      );
    if (!reservedResult)
      throw new NotFoundException('Product variant not found.');
    return await this.findVariantEntityByIdOrThrow(
      variant.id,
      variant.productId,
    );
  }

  private validateVariantListNotEmpty(
    variantCreateDtos: ProductVariantCreateRequestDto[],
  ): void {
    if (!variantCreateDtos.length) {
      throw new BadRequestException('Product must have at least one variant.');
    }
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
