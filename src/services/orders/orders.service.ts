import { Injectable } from '@nestjs/common';
import { INewOrderDto } from 'src/dto/new-order.dto';
import { Order } from 'src/entities/order.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrdersService {
    private readonly ordersRepository: Repository<Order>;

    constructor (dataSource: DataSource) {
        this.ordersRepository = dataSource.getRepository(Order);
    }

    async createOrder(createOrderDto: INewOrderDto) {

    }
}
