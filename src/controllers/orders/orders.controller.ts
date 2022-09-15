import { Controller, Get, Inject, Logger, Render } from '@nestjs/common';
import injectionTokenKeys from 'src/injection-tokens';
import { DataSource } from 'typeorm';
import { BaseController } from '../base/base.controller';

@Controller(['', 'orders'])
export class OrdersController extends BaseController {
    private readonly logger = new Logger(OrdersController.name);

    constructor (@Inject(injectionTokenKeys.appName) appName: string, private readonly dataSource: DataSource) {
        super(appName);
    }

    @Get()
    @Render('orders/orders')
    viewOrders() {
        return { data: {}, view: this.viewBag };
    }

    @Get('create')
    @Render('orders/new/create-order')
    createOrder() {
        this.viewBag.pageTitle = 'Create an order';
        return { data: {}, view: this.viewBag };
    }
}
