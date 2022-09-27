import { Injectable, Logger } from '@nestjs/common';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { Client } from 'src/entities/client.entity';
import { InvoiceItemAdditionalService } from 'src/entities/invoice-item-additional-service.entity';
import { InvoiceItem } from 'src/entities/invoice-item.entity';
import { Invoice, InvoiceStatus } from 'src/entities/invoice.entity';
import { OrderEntryAttribute } from 'src/entities/order-entry-attribute.entity';
import { OrderEntry } from 'src/entities/order-entry.entity';
import { Order, OrderStatus } from 'src/entities/order.entity';
import { ProductServicePrice } from 'src/entities/product-service-price.entity';
import { Roles } from 'src/entities/roles';
import { OfferedService } from 'src/entities/service.entity';
import { IPrincipal } from 'src/models/principal.model';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  private readonly ordersRepository: Repository<Order>;
  private readonly productServicePriceRepository: Repository<ProductServicePrice>;
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private dataSource: DataSource,
    private readonly userService: UsersService,
    private readonly productService: ProductsService
  ) {
    this.ordersRepository = dataSource.getRepository(Order);
    this.productServicePriceRepository =
      dataSource.getRepository(ProductServicePrice);
  }

  async getNextInvoiceId() {
    const maxIdOrder = await this.ordersRepository.createQueryBuilder('o')
      .select('coalesce((max(o.id)+1), 1)', 'nextInvoiceId')
      .getRawOne()

    return parseInt(maxIdOrder?.nextInvoiceId || '0');
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

  async findOrdersWithCodeLike(code: string) {
    const order = await this.ordersRepository.createQueryBuilder()
      .where('code LIKE :c', { c: `%${code}%` })
      .getMany();
    return order;
  }

  private async generateOrderCode() {
    const nextId = await this.getNextInvoiceId();
    return `#${new Intl.NumberFormat('en-CM', { minimumIntegerDigits: 3 }).format(nextId)}`;
  }

  async createOrder(createOrderDto: NewOrderDto) {
    try {
      const currentUser = await this.userService.getCurrentUser();
      const client = await this.dataSource.getRepository<Client>(Client).findOneByOrFail({ id: parseInt(createOrderDto.clientId) });
      let price = 0;
      let order: Order = new Order();
      order.customerId = client.id;
      order.dueDate = new Date(createOrderDto.dueDate);
      order.recorderId = currentUser.id;
      order.code = await this.generateOrderCode();
      for (let entry of createOrderDto.orderEntries) {
        const productServicePrices = await this.productService.getProductPrices({ productId: parseInt(entry.productId), serviceIds: [...((entry.additionalServices || []).map(service => parseInt(service.id))), parseInt(entry.serviceId)] });
        price += parseInt(entry.quantity) * productServicePrices.servicePrices.reduce((acc: number, curr) => acc + (entry.priceMode == 'normal' ? curr.normalPrice : curr.fastPrice), 0);
      }

      const total = price + parseFloat(createOrderDto.tax);
      const netPayable = total - parseFloat(createOrderDto.discount);
      const amountPaid = parseFloat(createOrderDto.amountPaid);
      const balance = netPayable - amountPaid;

      order.status = balance <= 0 ? OrderStatus.PENDING_PICKUP : OrderStatus.RECORDED;
      order = await this.ordersRepository.save(order);

      for (let entry of createOrderDto.orderEntries) {
        let orderEntry = new OrderEntry();

        let colorAttribute = new OrderEntryAttribute();
        colorAttribute.name = 'Color';
        colorAttribute.value = entry.color;

        colorAttribute = await this.dataSource.getRepository<OrderEntryAttribute>(OrderEntryAttribute)
          .save(colorAttribute);

        orderEntry.attributes = [colorAttribute];
        orderEntry.orderId = order.id;
        orderEntry.productId = parseInt(entry.productId);
        orderEntry.quantity = parseInt(entry.quantity);
        orderEntry.serviceId = parseInt(entry.serviceId);
        orderEntry = await this.dataSource.getRepository<OrderEntry>(OrderEntry).save(orderEntry);
      }

      let invoice = new Invoice();
      invoice.amountPaid = amountPaid;
      invoice.balance = balance;
      invoice.netPayable = netPayable;
      invoice.order = order;
      invoice.orderId = order.id;
      invoice.recordedBy = currentUser;
      invoice.status = balance <= 0 ? InvoiceStatus.PAID : balance == netPayable ? InvoiceStatus.UNPAID : InvoiceStatus.PARTIALLY_PAID;
      invoice.total = total;
      invoice.dueDate = new Date(createOrderDto.dueDate);

      invoice = await this.dataSource.getRepository<Invoice>(Invoice).save(invoice);

      for (let entry of createOrderDto.orderEntries) {
        const product = await this.productService.getProduct(parseInt(entry.productId));
        let service = await this.dataSource.getRepository<OfferedService>(OfferedService).findOneBy({ id: parseInt(entry.serviceId) });
        let invoiceItem: InvoiceItem = new InvoiceItem();
        invoiceItem.priceMode = entry.priceMode;
        invoiceItem.invoiceId = invoice.id;
        invoiceItem.productId = product.id;
        invoiceItem.productName = product.name;
        invoiceItem.serviceId = service.id;
        invoiceItem.serviceName = service.name;
        invoiceItem = await this.dataSource.getRepository<InvoiceItem>(InvoiceItem).save(invoiceItem);

        for (let aService of entry.additionalServices) {
          const price = await this.productServicePriceRepository.findOneBy({ serviceId: parseInt(aService.id), productId: parseInt(entry.productId) });
          service = await this.dataSource.getRepository<OfferedService>(OfferedService).findOneBy({ id: parseInt(aService.id) });
          let additionalService = new InvoiceItemAdditionalService();
          additionalService.invoiceItemId = invoiceItem.id;
          additionalService.price = parseInt(entry.quantity) * (price == null ? 0 : entry.priceMode == 'normal' ? price.normalPrice : price.fastPrice);
          additionalService.serviceId = service.id;
          additionalService.serviceName = service.name;
          additionalService = await this.dataSource.getRepository<InvoiceItemAdditionalService>(InvoiceItemAdditionalService).save(additionalService);
        }
      }

      return { success: true, message: 'Order created successfully', order, invoice };
    } catch (e) {
      this.logger.error(e.message);
      return { success: false, message: e.message, order: null };
    }
  }

  async getOrdersAvailableForUser(
    startAt: number = 0,
    size: number = 50,
  ) {
    const dbUser = await this.userService.getCurrentUser();
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

    let totalRecords: number;
    if (query.where) {
      totalRecords = await this.ordersRepository.count({
        where: query.where || {},
      });
    } else {
      totalRecords = await this.ordersRepository.count();
    }
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
