import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { NewOrderDto } from 'src/dto/new-order.dto';
import { UpdateOrderInvoiceDto } from 'src/dto/update-order-invoice.dto';
import { Client } from 'src/entities/client.entity';
import { InvoiceItemAdditionalService } from 'src/entities/invoice-item-additional-service.entity';
import { InvoiceItem } from 'src/entities/invoice-item.entity';
import { Invoice, InvoiceStatus } from 'src/entities/invoice.entity';
import { OrderEntryAttribute } from 'src/entities/order-entry-attribute.entity';
import { OrderEntry } from 'src/entities/order-entry.entity';
import { Order, OrderStatus } from 'src/entities/order.entity';
import { OrdersView } from 'src/entities/orders.view.entity';
import { ProductServicePrice } from 'src/entities/product-service-price.entity';
import { Roles } from 'src/entities/roles';
import { OfferedService } from 'src/entities/service.entity';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
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
    private readonly productService: ProductsService,
  ) {
    this.ordersRepository = dataSource.getRepository(Order);
    this.productServicePriceRepository =
      dataSource.getRepository(ProductServicePrice);
  }

  private async getNextInvoiceId() {
    const maxIdOrder = await this.ordersRepository
      .createQueryBuilder('o')
      .select('coalesce((max(o.id)+1), 1)', 'nextInvoiceId')
      .getRawOne();

    return parseInt(maxIdOrder?.nextInvoiceId || '0');
  }

  async getOrderForReceipt(id: number) {
    const currentUser = await this.userService.getCurrentUser();
    if (!currentUser) throw new UnauthorizedException();

    // const hasElevatedPrivileges = await this.userService.isUserInRoles(['system', 'admin'], currentUser.username);
    let query: FindOneOptions<Order> = {
      relations: {
        invoice: { items: { additionalServices: true } },
        customer: true,
        entries: true,
      },
      where: { id },
    };

    /* if (!hasElevatedPrivileges) {
      query = { ...query, where: { recorderId: currentUser.id } };
    } */

    const order = await this.ordersRepository.findOne(query);
    return order;
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
    const order = await this.ordersRepository
      .createQueryBuilder()
      .where('code LIKE :c', { c: `%${code}%` })
      .getMany();
    return order;
  }

  async generateOrderCode() {
    const nextId = await this.getNextInvoiceId();
    return `#${new Intl.NumberFormat('en-CM', {
      useGrouping: false,
      minimumFractionDigits: 0,
      minimumIntegerDigits: 3,
    }).format(nextId)}`;
  }

  async createOrder(createOrderDto: NewOrderDto) {
    try {
      const currentUser = await this.userService.getCurrentUser();
      const client = await this.dataSource
        .getRepository<Client>(Client)
        .findOneByOrFail({ id: parseInt(createOrderDto.clientId) });
      let price = 0;
      let order: Order = new Order();
      order.customerId = client.id;
      order.dueDate = new Date(createOrderDto.dueDate);
      order.recorderId = currentUser.id;
      order.code = await this.generateOrderCode();
      for (let entry of createOrderDto.orderEntries) {
        const productServicePrices = await this.productService.getProductPrices(
          {
            productId: parseInt(entry.productId),
            serviceIds: [
              ...(entry.additionalServices || []).map((service) =>
                parseInt(service.id),
              ),
              parseInt(entry.serviceId),
            ],
          },
        );
        price +=
          parseInt(entry.quantity) *
          productServicePrices.servicePrices.reduce(
            (acc: number, curr) =>
              acc +
              (entry.priceMode == 'normal' ? curr.normalPrice : curr.fastPrice),
            0,
          );
      }

      const total = price + parseFloat(createOrderDto.tax);
      const netPayable = total - parseFloat(createOrderDto.discount);
      const amountPaid = parseFloat(createOrderDto.amountPaid);
      const balance = netPayable - amountPaid;

      order.status =
        balance <= 0 ? OrderStatus.PENDING_PICKUP : OrderStatus.RECORDED;
      order = await this.ordersRepository.save(order);

      for (let entry of createOrderDto.orderEntries) {
        let orderEntry = new OrderEntry();

        let colorAttribute = new OrderEntryAttribute();
        colorAttribute.name = 'Color';
        colorAttribute.value = entry.color;

        colorAttribute = await this.dataSource
          .getRepository<OrderEntryAttribute>(OrderEntryAttribute)
          .save(colorAttribute);

        orderEntry.attributes = [colorAttribute];
        orderEntry.orderId = order.id;
        orderEntry.productId = parseInt(entry.productId);
        orderEntry.quantity = parseInt(entry.quantity);
        orderEntry.serviceId = parseInt(entry.serviceId);
        orderEntry = await this.dataSource
          .getRepository<OrderEntry>(OrderEntry)
          .save(orderEntry);
      }

      let invoice = new Invoice();
      invoice.amountPaid = amountPaid;
      invoice.balance = balance;
      invoice.netPayable = netPayable;
      invoice.tax = parseInt(createOrderDto.tax);
      invoice.discount = parseInt(createOrderDto.discount);
      invoice.order = order;
      invoice.orderId = order.id;
      invoice.recordedBy = currentUser;
      invoice.status =
        balance <= 0
          ? InvoiceStatus.PAID
          : balance == netPayable
            ? InvoiceStatus.UNPAID
            : InvoiceStatus.PARTIALLY_PAID;
      invoice.total = total;
      invoice.dueDate = new Date(createOrderDto.dueDate);
      invoice.paymentType = createOrderDto.paymentType;

      invoice = await this.dataSource
        .getRepository<Invoice>(Invoice)
        .save(invoice);

      for (let entry of createOrderDto.orderEntries) {
        const product = await this.productService.getProduct(
          parseInt(entry.productId),
        );
        let service = await this.dataSource
          .getRepository<OfferedService>(OfferedService)
          .findOneBy({ id: parseInt(entry.serviceId) });
        let productServicePrice = await this.productServicePriceRepository.findOneBy({
          serviceId: service.id,
          productId: product.id
        });

        let invoiceItem: InvoiceItem = new InvoiceItem();
        invoiceItem.priceMode = entry.priceMode;
        invoiceItem.invoiceId = invoice.id;
        invoiceItem.productId = product.id;
        invoiceItem.productName = product.name;
        invoiceItem.serviceId = service.id;
        invoiceItem.serviceName = service.name;
        invoiceItem.servicePriceSnapshot = parseInt(entry.quantity) * (productServicePrice == null
          ? 0
          : entry.priceMode == 'normal'
            ? productServicePrice.normalPrice
            : productServicePrice.fastPrice);

        invoiceItem.quantity = parseInt(entry.quantity);
        invoiceItem = await this.dataSource
          .getRepository<InvoiceItem>(InvoiceItem)
          .save(invoiceItem);

        if (!entry.additionalServices || entry.additionalServices.length == 0) continue;

        for (let aService of entry.additionalServices) {
          const productServicePrice = await this.productServicePriceRepository.findOneBy({
            serviceId: parseInt(aService.id),
            productId: parseInt(entry.productId),
          });
          service = await this.dataSource
            .getRepository<OfferedService>(OfferedService)
            .findOneBy({ id: parseInt(aService.id) });
          let additionalService = new InvoiceItemAdditionalService();
          additionalService.invoiceItemId = invoiceItem.id;
          additionalService.price =
            parseInt(entry.quantity) *
            (productServicePrice == null
              ? 0
              : entry.priceMode == 'normal'
                ? productServicePrice.normalPrice
                : productServicePrice.fastPrice);
          additionalService.serviceId = service.id;
          additionalService.serviceName = service.name;
          additionalService.invoiceId = invoice.id;
          additionalService = await this.dataSource
            .getRepository<InvoiceItemAdditionalService>(
              InvoiceItemAdditionalService,
            )
            .save(additionalService);
        }
      }

      return {
        success: true,
        message: 'Order created successfully',
        order,
        invoice,
      };
    } catch (e) {
      this.logger.error(e.message);
      return { success: false, message: e.message, order: null };
    }
  }

  async getOrdersAvailableForUser(startAt: number = 0, size: number = 50) {
    const dbUser = await this.userService.getCurrentUser();
    const hasElevatedPrivileges = dbUser.roles.some(
      (role) => role.roleName == Roles.ADMIN || role.roleName == Roles.SYSTEM,
    );
    const repo = this.dataSource.getRepository<OrdersView>(OrdersView);
    let query: FindManyOptions<OrdersView> = {
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
      totalRecords = await repo.count({
        where: query.where || {},
      });
    } else {
      totalRecords = await repo.count();
    }
    const totalPages = Math.ceil(totalRecords / size);
    const firstPageIndex = 0;
    const lastPageIndex = totalPages - 1;
    const isFirstPage = startAt == 0;
    const isLastPage = firstPageIndex == lastPageIndex;
    let queryBuilder = repo
      .createQueryBuilder()
      .select('coalesce(sum(net_payable), 0)', 'totalPayable')
      .addSelect('coalesce(sum(amount_paid), 0)', 'totalPaid')
      .addSelect('coalesce((select sum(balance) from vw_orders where balance >= 0), 0)', 'totalOutstanding');
    if (!hasElevatedPrivileges) {
      queryBuilder = queryBuilder.where('recorder_id = :id', { id: dbUser.id });
    }
    let statistics = await queryBuilder.getRawOne<{
      totalPayable: string;
      totalPaid: string;
      totalOutstanding: string;
    }>();

    const orders = await repo.find(query);
    return {
      orders,
      statistics: {
        totalPayable: parseFloat(statistics.totalPayable),
        totalPaid: parseFloat(statistics.totalPaid),
        totalOutstanding: parseFloat(statistics.totalOutstanding),
      },
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

  async getOrderForUpdate(_id: string | number) {
    let id: number;
    if (typeof _id == 'string') id = parseInt(_id);

    const dbUser = await this.userService.getCurrentUser();
    if (!dbUser) throw new UnauthorizedException();

    const hasElevatedPrivileges = dbUser.roles.some(
      (role) => role.roleName == Roles.ADMIN || role.roleName == Roles.SYSTEM,
    );
    let query: FindOneOptions<Order> = {
      relations: {
        invoice: { items: { additionalServices: true } },
        customer: true,
      },
      where: { id },
    };

    if (!hasElevatedPrivileges) {
      query = { ...query, where: { id, recorderId: dbUser.id } };
    }

    const order = await this.ordersRepository.findOne(query);
    if (!order) return null;
    const dto = new UpdateOrderInvoiceDto();
    dto.amountPaid = order.invoice.amountPaid.toString();
    dto.clientNames = `${order.customer.first_name} ${order.customer.last_name || ''
      }`.trim();
    dto.dueDate = order.dueDate || order.invoice.dueDate;
    dto.netPayable = order.invoice.netPayable.toString();
    dto.paymentType = order.invoice.paymentType;
    dto.orderId = order.id.toString();
    dto.orderCode = order.code;
    dto.invoiceId = order.invoice.id.toString();
    dto.discount = order.invoice.discount.toString();
    dto.tax = order.invoice.tax.toString();
    dto.total = order.invoice.total.toString();
    dto.markAsDelivered = String(order.status == OrderStatus.DELIVERED);
    dto.serviceCount = `${1 +
      order.invoice.items
        ?.flatMap((item) => item.additionalServices.length)
        .reduce((acc, curr) => acc + curr, 0)
      }`;
    return dto;
  }

  async updateOrderInvoice(dto: UpdateOrderInvoiceDto) {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) throw new UnauthorizedException();

      let order = await this.ordersRepository.findOne({
        relations: { invoice: true },
        where: { id: parseInt(dto.orderId) },
      });
      let invoice = order.invoice;
      invoice.amountPaid = parseFloat(dto.amountPaid);
      invoice.dueDate = new Date(dto.dueDate);
      invoice.paymentType = dto.paymentType;
      const netPayable = invoice.netPayable;
      const amountPaid = invoice.amountPaid;
      const balance = netPayable - amountPaid;
      invoice.status =
        balance <= 0
          ? InvoiceStatus.PAID
          : balance == netPayable
            ? InvoiceStatus.UNPAID
            : InvoiceStatus.PARTIALLY_PAID;
      invoice.balance = balance;
      order.status =
        balance <= 0 ? OrderStatus.PENDING_PICKUP : OrderStatus.RECORDED;
      if (
        order.status == OrderStatus.PENDING_PICKUP &&
        dto.markAsDelivered === 'true'
      ) {
        order.status = OrderStatus.DELIVERED;
      }
      const repo = this.dataSource.getRepository<Invoice>(Invoice);
      invoice = await repo.save(invoice);
      order = await this.ordersRepository.save(order);

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async getOrderById(id: number) {
    return this.ordersRepository.findOneBy({ id });
  }

  async deleteOrderById(id: number) {
    const order = await this.ordersRepository.findOne({
      relations: {
        invoice: { items: { additionalServices: true } },
        entries: { attributes: true }
      },
      where: { id }
    });

    if (!order) throw new Error('Order not found: ' + id);

    for (let invoiceItem of order.invoice.items) {
      if (invoiceItem.additionalServices && invoiceItem.additionalServices.length > 0) {
        await this.dataSource.getRepository<InvoiceItemAdditionalService>(InvoiceItemAdditionalService)
          .remove(invoiceItem.additionalServices, { transaction: true });
      }
    }
    await this.dataSource.getRepository<InvoiceItem>(InvoiceItem)
      .remove(order.invoice.items, { transaction: true });
    await this.dataSource.getRepository<Invoice>(Invoice)
      .remove(order.invoice, { transaction: true });

    for (let orderEntry of order.entries) {
      if (orderEntry.attributes && orderEntry.attributes.length > 0)
        await this.dataSource.getRepository<OrderEntryAttribute>(OrderEntryAttribute)
          .remove(orderEntry.attributes, { transaction: true });
    }
    await this.dataSource.getRepository<OrderEntry>(OrderEntry)
      .remove(order.entries, { transaction: true });
    await this.ordersRepository.remove(order);
  }

  async getRecentNLookupOrders(n: number) {
    if (n < 0) throw new Error('n cannot be less than zero');

    const orders = await this.ordersRepository.find({
      order: {
        dateCreated: 'DESC',
        lastUpdated: 'DESC'
      },
      take: n,
      relations: { customer: true, invoice: true }
    });

    if (orders && orders.length > 0)
      return orders.map(
        (order) => {
          const { id, code, status: orderStatus, invoice: { status: invoiceStatus }, customer: { phone, first_name, last_name } } = order;
          return { id, text: `${code} ${`${first_name} ${last_name || ''}`.trim()} (${phone || 'N/A'}) (${orderStatus == OrderStatus.DELIVERED ? 'DELIVERED' : orderStatus == OrderStatus.PENDING_PICKUP ? 'PENDING PICKUP' : 'RECORDED'}, ${invoiceStatus == InvoiceStatus.PAID ? 'PAID' : invoiceStatus == InvoiceStatus.PARTIALLY_PAID ? 'PARTIALLY PAID' : 'UNPAID'})` };
        }
      );
    return [];
  }

  async searchOrders(query: string, size: number) {
    const orders = await this.dataSource.getRepository<OrdersView>(OrdersView).createQueryBuilder()
      .where('code like :code', { code: `%${query}%` })
      .orWhere('customer like :customer', { customer: `%${query}%` })
      .orWhere('phone like :phone', { phone: `%${query}%` })
      .orderBy('date_recorded', 'DESC')
      .limit(size)
      .getMany();
    if (!orders || orders.length == 0) return [];
    return orders.map(order => {
      const { orderId: id, code, customer, phone, orderStatus, invoiceStatus } = order;
      return { id, text: `${code} ${customer} (${phone}) (${orderStatus == OrderStatus.DELIVERED ? 'DELIVERED' : orderStatus == OrderStatus.PENDING_PICKUP ? 'PENDING PICKUP' : 'RECORDED'}, ${invoiceStatus == InvoiceStatus.PAID ? 'PAID' : invoiceStatus == InvoiceStatus.PARTIALLY_PAID ? 'PARTIALLY PAID' : 'UNPAID'})` };
    });
  }
}