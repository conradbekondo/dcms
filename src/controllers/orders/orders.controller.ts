import { Controller, Get, Inject, Logger, Query, Render, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { distinctUntilKeyChanged, lastValueFrom, map, of, reduce, switchMap } from 'rxjs';
import { Role } from 'src/decorators/role.decorator';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { Category } from 'src/entities/category.entity';
import { Roles } from 'src/entities/roles';
import { BadQueryParamsException } from 'src/exceptions/bad-query.exception';
import { BadQueryFilter } from 'src/filters/bad-query.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/auth/role.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { OrdersService } from 'src/services/orders/orders.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller(['', 'orders'])
@UseGuards(AuthGuard, RoleGuard)
@Role(Roles.STAFF, Roles.ADMIN, Roles.SYSTEM)
export class OrdersController extends BaseController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(@Inject(injectionTokenKeys.appName) appName: string,
        userService: UsersService,
        private readonly orderService: OrdersService) {
        super(appName, userService);
    }

    @Get('/create')
    @Render('orders/new/create-order')
    async createOrder() {
        this.viewBag.pageTitle = 'Create an Order';
        return { data: { dto: new NewOrderDto() }, view: this.viewBag };
    }

    @Get()
    @Render('orders/orders')
    @UseFilters(BadQueryFilter)
    async viewOrders(
        @Res() res: Response,
        @Req() req: Request,
        @Query('startAt') startAt?: string,
        @Query('size') size?: string
    ) {

        if (!startAt || !size) {
            throw new BadQueryParamsException({ startAt: startAt || 0, size: size || 50 });
        }

        this.viewBag.pageTitle = 'All Orders';
        const principal = this.userService.getPrincipal();
        const pageInfo = await this.orderService.getOrdersAvailableForUser(principal, parseInt(startAt), parseInt(size));
        return { data: pageInfo, view: this.viewBag };
    }
}
