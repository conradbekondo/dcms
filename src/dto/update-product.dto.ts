export interface UpdateProductDto {
  id: string;
  categoryId: string;
  icon: string;
  productName: string;
  services: {
    id: string;
    name: string;
    isAdditional: string;
    normalPrice: string;
    fastPrice: string;
  }[];
}
