import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantCreateRequestDto } from '../dto/product-variants/request/product-variant-create.request.dto';
import { ShopStatus } from '../../users/entities/shop.entity';
import type { ResultSetHeader } from 'mysql2';

@Injectable()
export class ProductVariantsRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  async findActiveVariantsByIds(
    variantIds: string[],
  ): Promise<ProductVariant[]> {
    return await this.variantsRepository.find({
      where: { id: In(variantIds), isActive: true, isDeleted: false },
      relations: {
        product: true,
        cartItems: true,
      },
    });
  }

  async findVariantByIdAndProductIdAndShopId(
    id: string,
    shopId: string,
    productId: string,
  ): Promise<ProductVariant | null> {
    return await this.variantsRepository.findOne({
      where: { id: id, productId: productId, product: { shopId: shopId } },
      relations: { product: true },
    });
  }

  async findPurchasableProductVariantById(
    id: string,
  ): Promise<ProductVariant | null> {
    return await this.variantsRepository.findOne({
      where: {
        id: id,
        isActive: true,
        isDeleted: false,
        product: {
          isActive: true,
          isDeleted: false,
          shop: { shopStatus: ShopStatus.ACTIVE, isDeleted: false },
        },
      },
      relations: { product: true },
    });
  }

  async findPurchasableProductVariantsByIds(
    ids: string[],
  ): Promise<ProductVariant[]> {
    return await this.variantsRepository.find({
      where: {
        id: In(ids),
        isActive: true,
        isDeleted: false,
        product: {
          isActive: true,
          isDeleted: false,
          shop: {
            isDeleted: false,
            shopStatus: ShopStatus.ACTIVE,
          },
        },
      },
      relations: { product: true },
    });
  }

  async findActiveVariantByIdAndAndProductIdAndLockForUpdate(
    id: string,
    productId: string,
  ): Promise<ProductVariant | null> {
    return await this.variantsRepository
      .createQueryBuilder('product_variants')
      .setLock('pessimistic_write')
      .where(
        'product_variants.id = :id AND product_variants.productId = :productId',
        { id, productId },
      )
      .andWhere('product_variants.isActive = true')
      .andWhere('product_variants.isDeleted = false')
      .getOne();
  }

  async findAllProductVariantByProductId(
    productId: string,
  ): Promise<ProductVariant[]> {
    return this.variantsRepository.find({
      where: {
        productId,
        isDeleted: false,
        product: {
          isActive: true,
          isDeleted: false,
          shop: { shopStatus: ShopStatus.ACTIVE, isDeleted: false },
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createVariants(
    productId: string,
    variantCreateDtos: ProductVariantCreateRequestDto[],
  ): Promise<ProductVariant[]> {
    const variants = this.variantsRepository.create(
      variantCreateDtos.map((variant) => ({
        ...variant,
        color: variant.color?.trim(),
        size: variant.size,
        productId,
        product: { id: productId },
      })),
    );
    return this.variantsRepository.save(variants);
  }

  async reserveVariantsAmountByVariantIdsAtomically(
    reserveRequests: { variantId: string; quantity: number }[],
  ): Promise<number> {
    if (reserveRequests.length === 0) return 0;

    const variantIds = reserveRequests.map((request) => request.variantId);
    const whenCases = reserveRequests
      .map(() => `WHEN id = ? THEN amount - ?`)
      .join(' ');
    const conditions = reserveRequests.map(() => `(id = ? AND amount >= ?)`);
    const whenParameters = reserveRequests.flatMap((request) => [
      request.variantId,
      request.quantity,
    ]);
    const conditionParameters = reserveRequests.flatMap((request) => [
      request.variantId,
      request.quantity,
    ]);
    const sql = `
        UPDATE product_variants 
        SET amount = CASE ${whenCases} ELSE amount END
        WHERE id IN (?) AND (${conditions.join(' OR ')})
      `;
    const updateResult: ResultSetHeader = await this.variantsRepository.query(
      sql,
      [...whenParameters, variantIds, ...conditionParameters],
    );
    return updateResult.affectedRows;
  }

  async restockVariantAmountByAtomically(
    id: string,
    quantity: number,
  ): Promise<number> {
    const updateResult = await this.variantsRepository
      .createQueryBuilder()
      .update(ProductVariant)
      .set({ amount: () => 'amount + :quantity' })
      .where('id = :id', {
        id: id,
      })
      .setParameter('quantity', quantity)
      .execute();
    return updateResult.affected ?? 0;
  }

  async save(variant: ProductVariant): Promise<ProductVariant> {
    return this.variantsRepository.save(variant);
  }

  async softDelete(variantId: string): Promise<number> {
    const result = await this.variantsRepository.update(
      { id: variantId, isDeleted: false },
      { isActive: false, isDeleted: true },
    );
    return result.affected ?? 0;
  }
}
