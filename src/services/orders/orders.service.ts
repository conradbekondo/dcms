import { Injectable } from '@nestjs/common';
import { INewOrderDto } from 'src/dto/new-order.dto';
import { Order } from 'src/entities/order.entity';
import { Roles } from 'src/entities/roles';
import { IPrincipal } from 'src/models/principal.model';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
    private readonly ordersRepository: Repository<Order>;

    constructor(dataSource: DataSource,
        private readonly userService: UsersService,) {
        this.ordersRepository = dataSource.getRepository(Order);
    }

    async createOrder(createOrderDto: INewOrderDto) {

    }

    async getOrdersAvailableForUser(user: IPrincipal | number | string, startAt: number = 0, size: number = 50) {
        const dbUser = await this.userService.getUser(user);
        const hasElevatedPrivileges = dbUser.roles.some(role => role.roleName == Roles.ADMIN || role.roleName == Roles.SYSTEM);
        const orders = await this.ordersRepository.findAndCount({})
    }
}
