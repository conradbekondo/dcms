import { Controller, Get, Inject, Render } from '@nestjs/common';
import injectionTokenKeys from 'src/injection-tokens';
import { BaseController } from '../base/base.controller';

@Controller('orders')
export class OrdersController extends BaseController {
    constructor (@Inject(injectionTokenKeys.appName) appName: string) {
        super(appName);
    }
    @Get()
    @Render('orders/orders')
    viewOrders() {
        return { data: {}, view: this.viewBag };
    }
}
