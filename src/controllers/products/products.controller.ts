import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IProductDto } from 'src/dto/product.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { CategoriesService } from 'src/services/categories/categories.service';
import { OfferedServicesService } from 'src/services/offered-services/offered-services.service';
import { ProductsService } from 'src/services/products/products.service';
import { UsersService } from 'src/services/users/users.service';
import { DataSource } from 'typeorm';
import { BaseController } from '../base/base.controller';

@Controller(['products'])
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class ProductsController extends BaseController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    private readonly categoryService: CategoriesService,
    private readonly serviceService: OfferedServicesService,
    private readonly productService: ProductsService,
    usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  @Render('products/view_products')
  async viewProducts() {
    const products = await this.productService.getProducts()
    const categories = await this.categoryService.getCategories()
    const services = await this.serviceService.getServices()
    const additional = await this.serviceService.getAdditional()

    return { data: { products, categories, services, additional }, view: this.viewBag };
  }

  @Post()
  async storeProduct(@Body() data: IProductDto, @Req() req: Request, @Res() res: Response) {
    const errors: string[] = [];

    if (!data.name || data.name.length <= 0) {
      errors.push('Product name required')
      return res.status(400).json({ message: 'Unable to create product.', errors: errors })
    }

    if (!data.category || data.category <= 0) {
      errors.push('Product category required')
      return res.status(400).json({ message: 'Unable to create product.', errors: errors })
    }

    const stored = await this.productService.createProduct(data)

    if (stored.success)
      return res.status(201).json({ message: "Product created successfully." })
    else
      return res.status(500).json({ message: stored.error })
  }

  @Get(':id')
  async getProduct(@Param('id') id: number, @Res() res: Response) {
    const product = await this.productService.getProduct(id)
    return res.json(product)
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const deleted = await this.productService.deleteProduct(id)

    if (deleted.success)
      return res.json({ message: "Product deleted successfully." })
    else
      return res.status(500).json({ message: "Unable to delete product." })
  }
}
