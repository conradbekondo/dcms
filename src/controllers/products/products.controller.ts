import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { IProductDto } from 'src/dto/product.dto';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { Roles } from 'src/entities/roles';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { CategoriesService } from 'src/services/categories/categories.service';
import { OfferedServicesService } from 'src/services/offered-services/offered-services.service';
import { ProductsService } from 'src/services/products/products.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

class ProductServicePriceRequest {
  productId: string;
  serviceIds: string[];
}

@Controller(['products'])
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
@Role(Roles.ADMIN, Roles.STAFF, Roles.SYSTEM)
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

  @Post('prices')
  async getProductServicePrices(
    @Body() { requests }: { requests: ProductServicePriceRequest },
    @Res() res: Response,
  ) {
    const prices = await this.productService.getProductPrices({
      productId: parseInt(requests.productId),
      serviceIds: requests.serviceIds.map((id) => parseInt(id)),
    });
    return res.status(HttpStatus.OK).json(prices);
  }

  @Get()
  @Render('products/view_products')
  async viewProducts() {
    const products = await this.productService.getProducts();
    const categories = await this.categoryService.getCategories();
    const services = await this.serviceService.getServices(
      undefined,
      undefined,
      false,
    );
    const additional = await this.serviceService.getServices(
      undefined,
      undefined,
      true,
    );
    this.viewBag.pageTitle = 'Products';

    return {
      data: { products, categories, services, additional },
      view: this.viewBag,
    };
  }

  @Get('all')
  async getAllProducts(@Res() res: Response) {
    const products = await this.productService.getProducts();
    res.status(HttpStatus.OK).json(products);
  }

  @Post()
  async storeProduct(
    @Body() data: IProductDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const errors: string[] = [];

    if (!data.name || data.name.length <= 0) {
      errors.push('Product name required');
      return res
        .status(400)
        .json({ message: 'Unable to create product.', errors: errors });
    }

    if (!data.category || data.category <= 0) {
      errors.push('Product category required');
      return res
        .status(400)
        .json({ message: 'Unable to create product.', errors: errors });
    }

    const stored = await this.productService.createProduct(data);

    if (stored.success)
      return res.status(201).json({ message: 'Product created successfully.' });
    else return res.status(500).json({ message: stored.error });
  }

  @Get(':id')
  async getProduct(
    @Param('id') id: number,
    @Query('withServicePrices') withServicePrices: 'true' | 'false',
    @Res() res: Response,
  ) {
    if (withServicePrices == 'true') {
      const productWithPrices = await this.productService.getProductWithServicePrices(id);
      return res.status(HttpStatus.OK).json(productWithPrices);
    }
    const product = await this.productService.getProduct(id);
    return res.json(product);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deleted = await this.productService.deleteProduct(id);

    if (deleted.success)
      return res.json({ message: 'Product deleted successfully.' });
    else return res.status(500).json({ message: 'Unable to delete product.' });
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() data: UpdateProductDto
  ) {
    const result = await this.productService.updateProduct2(id, data);
    if (result.success) {
      return res.status(HttpStatus.ACCEPTED).send();
    } else {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ message: result.message });
    }
  }
}
