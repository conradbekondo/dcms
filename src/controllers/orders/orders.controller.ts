import { Controller, Get, Inject, Logger, Render, UseFilters, UseGuards } from '@nestjs/common';
import { Order } from 'src/entities/order.entity';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { OrdersService } from 'src/services/orders/orders.service';
import { DataSource, Repository } from 'typeorm';
import { BaseController } from '../base/base.controller';

@Controller(['', 'orders'])
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class OrdersController extends BaseController {
    private readonly logger = new Logger(OrdersController.name);
    private readonly ordersRepository: Repository<Order>;

    constructor (@Inject(injectionTokenKeys.appName) appName: string, private readonly ordersService: OrdersService) {
        super(appName);

    }

    @Get()
    @Render('orders/orders')
    async viewOrders() {
        // this.
        return { data: {}, view: this.viewBag };
    }

    @Get('create')
    @Render('orders/new/create-order')
    createOrder() {

        this.viewBag.pageTitle = 'Create an order';
        return { data: {}, view: this.viewBag };
    }
}
