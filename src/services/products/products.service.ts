import { Injectable, Logger } from '@nestjs/common';
import { IProductDto } from 'src/dto/product.dto';
import { ProductServicePrice } from 'src/entities/product-service-price.entity';
import { Product } from 'src/entities/product.entity';
import { OfferedService } from 'src/entities/service.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  private readonly productRepository: Repository<Product>;
  private readonly productServiceRepository: Repository<ProductServicePrice>;
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly datasource: DataSource) {
    this.productRepository = datasource.getRepository(Product);
    this.productServiceRepository =
      datasource.getRepository(ProductServicePrice);
  }

  /**
   * Get products index.
   *
   * @returns
   */
  async getProducts() {
    const products = await this.productRepository.find({
      relations: { category: true },
    });
    return products;
  }

  /**
   * Get given product data.
   *
   * @param id
   * @returns
   */
  async getProduct(id: number) {
    const product = await this.productRepository.findOneBy({ id: id });

    return product;
  }

  /**
   * Store newly created product.
   *
   * @param dto New product data
   * @returns
   */
  async createProduct(dto: IProductDto) {
    const exists = await this.productRepository.findOneBy({ name: dto.name });
    if (exists) {
      this.logger.warn(
        `Failed product creation attempt - Product with same name already exists.`,
      );
      return { success: false, error: 'Product already exists' };
    }

    let product = new Product();
    product.name = dto.name;
    product.categoryId = dto.category;
    product.iconUrl = dto.icon;

    product = await this.productRepository.save(product);

    (dto.services || []).forEach(async (service) => {
      const productServicePrice = new ProductServicePrice();
      productServicePrice.productId = product.id;
      productServicePrice.serviceId = service.id;

      if (service.type == 'normal')
        productServicePrice.normalPrice = service.price;
      else productServicePrice.fastPrice = service.price;

      await this.productServiceRepository.save(productServicePrice);
    });

    this.logger.log(`New product created with ID #${product.id}.`);
    return { success: true, product: product };
  }

  /**
   * Update the given product.
   *
   * @param dto New product data
   * @param id Product to update
   * @returns
   */
  async updateProduct(dto: IProductDto, id: number) {
    // TODO: update product and product service prices

    return { success: true };
  }

  /**
   * Delete the given product.
   *
   * @param id Product to delete
   * @returns
   */
  async deleteProduct(id: number) {
    const product = await this.productRepository.findOneBy({ id: id });

    if (product) {
      const product_prices = await this.productServiceRepository.findBy({
        productId: id,
      });
      product_prices.forEach(
        async (product_price) =>
          await this.productServiceRepository.delete({ id: product_price.id }),
      );
      await this.productRepository.delete({ id });

      return { success: true };
    } else {
      return { success: false, error: "Product doesn't exists" };
    }
  }

  async getProductWithServicePrices(id: number) {
    const result = await this.datasource
      .createQueryBuilder()
      .select('')
      .from(OfferedService, 's')
      .leftJoin(ProductServicePrice, 'psp', 'psp.product_id');
  }
}
