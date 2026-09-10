export interface ProductRaw {
  productId: string;
  productName: string;
  thumbnail: string;
  minPrice: number;
  relevancy?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}
