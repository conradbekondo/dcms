import { Injectable, Logger } from '@nestjs/common';
import { IProductDto } from 'src/dto/product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';
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

  async getProductPrices(map: { productId: number; serviceIds: number[] }) {
    const resMap: {
      productId: number;
      servicePrices: {
        serviceId: number;
        normalPrice: number;
        fastPrice: number;
      }[];
    } = { productId: map.productId, servicePrices: [] };
    for (let serviceId of map.serviceIds) {
      const price = await this.productServiceRepository.findOne({
        where: { productId: map.productId, serviceId },
      });
      if (!price) {
        resMap.servicePrices.push({ serviceId, normalPrice: 0, fastPrice: 0 });
      } else {
        resMap.servicePrices.push({
          serviceId,
          normalPrice: price.normalPrice || 0,
          fastPrice: price.fastPrice || 0,
        });
      }
    }
    return resMap;
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
    const exists = await this.productRepository.findOneBy({
      name: dto.name,
      categoryId: dto.category,
    });
    if (exists) {
      this.logger.warn(
        `Failed product creation attempt - Product with same name already exists.`,
      );
      return {
        success: false,
        error: 'Product already exists in this category',
      };
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
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) return null;
    const ans: {
      id: number;
      productName: string;
      categoryId: number;
      services: {
        id: number;
        name: string;
        fastPrice: number;
        normalPrice: number;
        isAdditional: boolean;
      }[];
      icon: string;
    } = {
      id: product.id,
      categoryId: product.categoryId,
      icon: product.iconUrl,
      productName: product.name,
      services: [],
    };

    const allServices =
      (await this.datasource
        .getRepository<OfferedService>(OfferedService)
        .find()) || [];

    for (let { id, isAdditional, name, description } of allServices) {
      const productServicePrice = await this.datasource
        .getRepository<ProductServicePrice>(ProductServicePrice)
        .findOne({
          where: {
            serviceId: id,
          },
        });
      ans.services.push({
        id,
        name,
        fastPrice: productServicePrice?.fastPrice || 0,
        isAdditional,
        normalPrice: productServicePrice?.normalPrice || 0,
      });
    }

    return ans;
  }

  async updateProduct2(productId: number, dto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product)
      return { product: null, success: false, message: 'Product not found' };
    else if (
      (await this.productRepository.countBy({
        categoryId: parseInt(dto.categoryId),
        name: dto.productName,
      })) > 0
    ) {
      return {
        product: null,
        success: false,
        message:
          'A product with this name already exists in the specified category',
      };
    }
    product.categoryId = parseInt(dto.categoryId);
    product.name = dto.productName;
    this.productRepository.save(product);

    const repo =
      this.datasource.getRepository<ProductServicePrice>(ProductServicePrice);
    for (let _service of dto.services) {
      let price = await repo.findOneBy({
        productId,
        serviceId: parseInt(_service.id),
      });
      if (!price) {
        price = new ProductServicePrice();
        price.productId = productId;
        price.serviceId = parseInt(_service.id);
        price = await repo.save(price);
      }
      price.fastPrice = parseFloat(_service.fastPrice);
      price.normalPrice = parseFloat(_service.normalPrice);
      price = await repo.save(price);
    }

    return { success: true };
  }
}
