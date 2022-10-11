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
  Render, Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Response } from 'express';
import { Role } from 'src/decorators/role.decorator';
import { NewClientDto } from 'src/dto/cleint.dto';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { UpdateOrderInvoiceDto } from 'src/dto/update-order-invoice.dto';
import { Roles } from 'src/entities/roles';
import { BadQueryFilter } from 'src/filters/bad-query.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { CategoriesService } from 'src/services/categories/categories.service';
import { ClientsService } from 'src/services/clients/clients.service';
import { ConfigService } from 'src/services/config/config.service';
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
    private readonly clientService: ClientsService,
    private readonly configService: ConfigService,
  ) {
    super(appName, userService);
  }

  @Get('lookup')
  async lookupOrder(
    @Query('q') q: string,
    @Query('size') size: string,
    @Res() res: Response,
  ) {
    const orders = await this.orderService.searchOrders(
      q,
      parseInt(size || '50'),
    );
    if (!orders || orders.length == 0)
      return res.status(HttpStatus.NOT_FOUND).json([]);
    return res.status(HttpStatus.OK).json(orders);
  }

  @Get('/create')
  @Render('orders/new/create-order')
  async createOrderView() {
    this.viewBag.pageTitle = 'Create an Order';
    const categories = await this.categoriesService.getCategories();
    const services = await this.offeredServicesService.getServices(
      0,
      999999999999,
    );
    const products = await this.productsService.getProducts();
    const clients = await this.clientService.getClients();
    const nextInvoiceId = await this.orderService.generateOrderCode();
    const recentOrders = await this.orderService.getRecentNLookupOrders(50);
    const stats = await this.orderService.getDayStats();
    return {
      data: {
        dayStats: stats,
        nextInvoiceId,
        clients,
        categories,
        services,
        products,
        config: this.configService.config,
        newClientDto: new NewClientDto(),
        dto: new NewOrderDto(),
        recentOrders,
      },
      view: this.viewBag,
    };
  }

  @Delete(':id')
  async deleteOrder(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: `Order not found: ${id}` });
    } else {
      try {
        await this.orderService.deleteOrderById(id);
        res.status(HttpStatus.OK).send();
      } catch ({ message }) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message });
      }
    }
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

  @Get('for_receipt/:id')
  async getOrderForReceipt(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const order = await this.orderService.getOrderForReceipt(id);
    if (!order) {
      return res.status(HttpStatus.NOT_FOUND).send();
    } else {
      return res.status(HttpStatus.OK).json({ order });
    }
  }

  @Get('for_update/:id')
  async getOrderForUpdate(@Param('id') id: string, @Res() res: Response) {
    const dto = await this.orderService.getOrderForUpdate(id);
    if (dto) {
      return res.status(HttpStatus.OK).json({
        invoice: dto,
      });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      text: `Order not found: ${id}`,
    });
  }

  @Put(':id')
  async updateOrderInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderInvoiceDto,
    @Res() res: Response,
  ) {
    const result = await this.orderService.updateOrderInvoice(dto);
    if (result.success) {
      return res.status(HttpStatus.ACCEPTED).send();
    } else {
      return res
        .status(HttpStatus.UNPROCESSABLE_ENTITY)
        .send({ text: result.message });
    }
  }

  @Get('ping')
  ping() {
    return { ok: true };
  }

  @Post('/create')
  @UsePipes(ValidationPipe)
  async createOrder(@Body() dto: NewOrderDto, @Res() res: Response) {
    const result = await this.orderService.createOrder(dto);
    if (result.success) {
      return res.status(HttpStatus.CREATED).send();
    } else {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: result.message });
    }
  }

  @Get()
  @Render('orders/orders')
  @UseFilters(BadQueryFilter)
  async viewOrders() {
    this.viewBag.pageTitle = 'All Orders';
    const orders = await this.orderService.getOrdersAvailableForUser();
    const stats = await this.orderService.getDayStats();
    return { data: { config: this.configService.config, dayStats: stats, orders }, view: this.viewBag };
  }
}
