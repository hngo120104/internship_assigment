export interface ProductRaw {
  productId: string;
  productName: string;
  thumbnail: string;
  minPrice: number;
  isActive?: boolean;
  isDeleted?: boolean;
}
