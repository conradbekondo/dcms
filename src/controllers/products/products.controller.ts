import {
  Controller,
  Get,
  Inject,
  Logger,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { DataSource } from 'typeorm';
import { BaseController } from '../base/base.controller';

@Controller(['products'])
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class ProductsController extends BaseController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    private readonly dataSource: DataSource,
  ) {
    super(appName);
  }

  @Get()
  @Render('products/view_products')
  viewProducts() {
    return { data: {}, view: this.viewBag };
  }

  // @Get('create')
  // @Render('products/view-products')
  // createProducts() {
  //     this.viewBag.pageTitle = 'Create a Product';
  //     return { data: {}, view: this.viewBag };
  // }
}
