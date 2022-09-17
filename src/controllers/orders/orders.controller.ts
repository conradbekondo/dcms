import { Controller, Get, Inject, Logger, Render, UseGuards } from '@nestjs/common';
import { Role } from 'src/decorators/role.decorator';
import { Roles } from 'src/entities/roles';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller(['orders'])
@UseGuards(AuthGuard)
@Role(Roles.STAFF, Roles.ADMIN, Roles.SYSTEM)
export class OrdersController extends BaseController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(@Inject(injectionTokenKeys.appName) appName: string,
        userService: UsersService) {
        super(appName, userService);
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
