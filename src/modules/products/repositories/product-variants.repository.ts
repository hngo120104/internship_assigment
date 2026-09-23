import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantCreateRequestDto } from '../dto/product-variants/request/product-variant-create.request.dto';
import { ShopStatus } from '../../users/entities/shop.entity';
import type { ResultSetHeader } from 'mysql2';
import { InvalidVariantAmountResult } from '../interfaces/invalid-variant-amount-result.interface';

@Injectable()
export class ProductVariantsRepository {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  async validateProductVariantsReadyForPurchasing(
    reserveRequests: { variantId: string; amount: number }[],
  ): Promise<InvalidVariantAmountResult[] | null> {
    const variantIds = reserveRequests.map((item) => item.variantId);
    const variants = await this.variantsRepository.find({
      select: { id: true, amount: true },
      where: { id: In(variantIds), isActive: true, isDeleted: false },
    });
    const insufficientVariantMap: InvalidVariantAmountResult[] = [];
    if (reserveRequests.length !== variants.length) return null;
    const variantsMap = new Map(
      variants.map((variant) => [variant.id, variant.amount]),
    );
    for (const item of reserveRequests) {
      const availableAmount = variantsMap.get(item.variantId);
      if (availableAmount === undefined || availableAmount < item.amount) {
        insufficientVariantMap.push({
          variantId: item.variantId,
          requestedAmount: item.amount,
          availableAmount: availableAmount ?? 0,
        });
      }
    }
    return insufficientVariantMap;
  }

  async findPurchasbleVariantsAmountWithIds(
    ids: string[],
  ): Promise<Partial<ProductVariant>[]> {
    return await this.variantsRepository.find({
      select: { id: true, amount: true },
      where: {
        id: In(ids),
        isActive: true,
        isDeleted: false,
        product: { isActive: true, isDeleted: false },
      },
    });
  }

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

  async reserveVariantsAmountById(
    reserveRequests: { variantId: string; amount: number }[],
  ): Promise<number> {
    const variantIds = reserveRequests.map((rq) => rq.variantId);
    const whenCases = reserveRequests
      .map(() => `WHEN id = ? THEN amount - ?`)
      .join(' ');
    const whenParameters = reserveRequests.flatMap((request) => [
      request.variantId,
      request.amount,
    ]);
    const sql = `
        UPDATE product_variants 
        SET amount = CASE ${whenCases} ELSE amount END
        WHERE id IN (?)
      `;
    const updateResult: ResultSetHeader = await this.variantsRepository.query(
      sql,
      [...whenParameters, variantIds],
    );
    return updateResult.affectedRows;
  }

  async reserveVariantsAmountByVariantIdsAtomically(
    reserveRequests: { variantId: string; amount: number }[],
  ): Promise<number> {
    const variantIds = reserveRequests.map((request) => request.variantId);
    const whenCases = reserveRequests
      .map(() => `WHEN id = ? THEN amount - ?`)
      .join(' ');
    const conditions = reserveRequests.map(
      () => `(id = ? AND amount >= ? AND is_active = 1 AND is_deleted = 0)`,
    );
    const whenParameters = reserveRequests.flatMap((request) => [
      request.variantId,
      request.amount,
    ]);
    const conditionParameters = reserveRequests.flatMap((request) => [
      request.variantId,
      request.amount,
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
    amount: number,
  ): Promise<number> {
    const updateResult = await this.variantsRepository
      .createQueryBuilder()
      .update(ProductVariant)
      .set({ amount: () => 'amount + :amount' })
      .where('id = :id', {
        id: id,
      })
      .setParameter('amount', amount)
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
