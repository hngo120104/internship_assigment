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

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly userShopsService: UserShopService,
    private readonly productVariantsRepo: ProductVariantsRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async findVariantEntityByIdOrThrow(
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

  async findActiveVariantEntityByIdOrThrow(
    variantId: string,
  ): Promise<ProductVariant> {
    const foundVariant =
      await this.productVariantsRepo.findActiveProductVariantById(variantId);
    if (!foundVariant)
      throw new NotFoundException('Product variant not found.');
    return foundVariant;
  }

  async findActiveVariantEntityByIdAndProductIdOrThrow(
    variantId: string,
    productId: string,
  ): Promise<ProductVariant> {
    const variant =
      await this.productVariantsRepo.findActiveProductVariantByIdAndProductId(
        variantId,
        productId,
      );
    if (!variant) throw new NotFoundException('Product variant not found.');
    return variant;
  }

  @Transactional()
  async createProductVariants(
    productId: string,
    variantCreateDtos: ProductVariantCreateRequestDto[],
  ): Promise<ProductVariant[]> {
    const product = await this.productsRepo.findProductById(productId);
    if (!product) throw new NotFoundException('Product not found.');
    this.validateVariantListNotEmpty(variantCreateDtos);
    this.validateVariantSizeAndColorAreUnique(variantCreateDtos);
    await this.validateVariantsDoNotAlreadyExist(productId, variantCreateDtos);
    return this.productVariantsRepo.createVariants(
      productId,
      variantCreateDtos,
    );
  }

  @Transactional()
  async updateProductVariant(
    variantId: string,
    productId: string,
    variantUpdateDto: ProductVariantUpdateRequestDto,
  ): Promise<ProductVariant> {
    const variant = await this.findActiveVariantEntityByIdAndProductIdOrThrow(
      variantId,
      productId,
    );
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
    return this.productVariantsRepo.save(variant);
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
    const variant = await this.findActiveVariantEntityByIdOrThrow(variantId);
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
      await this.productVariantsRepo.restockVariantAmountByProductIdAndVariantIdAomiccaly(
        variantId,
        productId,
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
