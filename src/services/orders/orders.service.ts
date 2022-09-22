import { Injectable } from '@nestjs/common';
import { from, map } from 'rxjs';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { Order } from 'src/entities/order.entity';
import { ProductServicePrice } from 'src/entities/product-service-price.entity';
import { Roles } from 'src/entities/roles';
import { IPrincipal } from 'src/models/principal.model';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  private readonly ordersRepository: Repository<Order>;
  private readonly productServicePriceRepository: Repository<ProductServicePrice>;

  constructor(
    dataSource: DataSource,
    private readonly userService: UsersService,
  ) {
    this.ordersRepository = dataSource.getRepository(Order);
    this.productServicePriceRepository =
      dataSource.getRepository(ProductServicePrice);
  }

  async getAllProductsAndServicesWithPrices() {
    const query: FindManyOptions<ProductServicePrice> = {
      relations: {
        service: true,
        product: { category: true },
      },
      loadRelationIds: true,
    };
    const prices = await this.productServicePriceRepository.find(query);
    // await this.productServicePriceRepository.query('SELECT * FR')
    return prices;
  }

  async createOrder(createOrderDto: NewOrderDto) {}

  async getOrdersAvailableForUser(
    user: IPrincipal | number | string,
    startAt: number = 0,
    size: number = 50,
  ) {
    const dbUser = await this.userService.getUser(user);
    const hasElevatedPrivileges = dbUser.roles.some(
      (role) => role.roleName == Roles.ADMIN || role.roleName == Roles.SYSTEM,
    );
    let query: FindManyOptions<Order> = {
      order: {
        dateCreated: 'DESC',
        lastUpdated: 'DESC',
      },
      skip: startAt * size,
      take: size,
    };

    if (!hasElevatedPrivileges)
      query = {
        ...query,
        where: { ...(query.where || {}), recorderId: dbUser.id },
      };

    const totalRecords = await this.ordersRepository.count({
      where: query.where,
    });
    const totalPages = Math.ceil(totalRecords / size) + 1;
    const isFirstPage = startAt == 0;
    const isLastPage =
      (await this.ordersRepository.count({
        where: query.where,
        skip: (startAt + 1) * size,
      })) <= 0;

    const orders = await this.ordersRepository.find(query);
    return {
      orders,
      pageInfo: {
        totalRecords,
        pageIndex: startAt,
        pageSize: orders.length,
        requestedSize: size,
        totalPages,
        isFirstPage,
        isLastPage,
      },
    };
  }
}
