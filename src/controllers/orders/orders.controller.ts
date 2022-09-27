import {
  Body,
  Controller,
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
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { NewClientDto } from 'src/dto/cleint.dto';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { UpdateOrderInvoiceDto } from 'src/dto/update-order-invoice.dto';
import { Roles } from 'src/entities/roles';
import { BadQueryParamsException } from 'src/exceptions/bad-query.exception';
import { BadQueryFilter } from 'src/filters/bad-query.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { CategoriesService } from 'src/services/categories/categories.service';
import { ClientsService } from 'src/services/clients/clients.service';
import { OfferedServicesService } from 'src/services/offered-services/offered-services.service';
import { OrdersService } from 'src/services/orders/orders.service';
import { ProductsService } from 'src/services/products/products.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller(['', 'orders'])
@UseGuards(AuthGuard, RoleGuard)
@Role(Roles.STAFF, Roles.ADMIN, Roles.SYSTEM)
export class OrdersController extends BaseController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    userService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly offeredServicesService: OfferedServicesService,
    private readonly orderService: OrdersService,
    private readonly clientService: ClientsService
  ) {
    super(appName, userService);
  }

  @Get('/create')
  @Render('orders/new/create-order')
  async createOrderView() {
    this.viewBag.pageTitle = 'Create an Order';
    const categories = await this.categoriesService.getCategories();
    const services = await this.offeredServicesService.getServices(0, 999999999999);
    const products = await this.productsService.getProducts();
    const clients = await this.clientService.getClients();
    const nextInvoiceId = `IV000${(await this.orderService.getNextInvoiceId())}`;
    return { data: { nextInvoiceId, clients, categories, services, products, newClientDto: new NewClientDto(), dto: new NewOrderDto() }, view: this.viewBag };
  }

  @Get('order/:code')
  async getOrderByCode(@Param('code') code: string, @Res() res: Response) {
    const orders = await this.orderService.findOrdersWithCodeLike(code);

    if (orders.length <= 0) {
      return res.status(HttpStatus.NOT_FOUND).send();
    } else {
      return res.status(HttpStatus.OK).json(orders);
    }
  }

  @Get('for_update/:id')
  async getOrderForUpdate(@Param('id') id: string, @Res() res: Response) {
    const dto = await this.orderService.getOrderForUpdate(id);
    if (dto) {
      return res.status(HttpStatus.OK).json({
        invoice: dto
      });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      text: `Order not found: ${id}`
    });
  }

  @Put(':id')
  async updateOrderInvoice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderInvoiceDto, @Res() res: Response) {
    const result = await this.orderService.updateOrderInvoice(dto);
    if (result.success) {
      return res.status(HttpStatus.ACCEPTED).send();
    } else {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({ text: result.message });
    }
  }

  @Post('/create')
  @UsePipes(ValidationPipe)
  async createOrder(@Body() dto: NewOrderDto, @Res() res: Response) {
    const result = await this.orderService.createOrder(dto);
    if (result.success) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: result.message });
    }
  }

  @Get()
  @Render('orders/orders')
  @UseFilters(BadQueryFilter)
  async viewOrders(
    @Res() res: Response,
    @Req() req: Request,
    @Query('startAt') startAt?: string,
    @Query('size') size?: string,
  ) {
    if (!startAt || !size) {
      throw new BadQueryParamsException({
        startAt: startAt || 0,
        size: size || 50,
      });
    }

    this.viewBag.pageTitle = 'All Orders';
    const pageInfo = await this.orderService.getOrdersAvailableForUser(
      parseInt(startAt),
      parseInt(size),
    );
    return { data: pageInfo, view: this.viewBag };
  }
}
