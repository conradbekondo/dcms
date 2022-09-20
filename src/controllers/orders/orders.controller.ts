import { Controller, Get, Inject, Logger, ParseIntPipe, Query, Render, UseGuards } from '@nestjs/common';
import { Role } from 'src/decorators/role.decorator';
import { Roles } from 'src/entities/roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { OrdersService } from 'src/services/orders/orders.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller(['', 'orders'])
@UseGuards(AuthGuard)
@Role(Roles.STAFF, Roles.ADMIN, Roles.SYSTEM)
export class OrdersController extends BaseController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(@Inject(injectionTokenKeys.appName) appName: string,
        userService: UsersService,
        private readonly orderService: OrdersService) {
        super(appName, userService);
    }

    @Get()
    @Render('orders/orders')
    async viewOrders(
        @Query('startAt', ParseIntPipe) startAt: number = 0,
        @Query('size', ParseIntPipe) size: number = 50
    ) {
        // const principal = this.userService.getPrincipal();
        // const orders = await this.orderService.getOrdersAvailableForUser(principal, startAt, size);
        return { data: {}, view: this.viewBag };
    }
}
