import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderEntryAttribute } from './order-entry-attribute.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { OfferedService } from './service.entity';

@Entity('order_entries')
export class OrderEntry extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Promise<Order>;

  @ManyToMany(() => OrderEntryAttribute, { eager: false })
  @JoinTable({
    name: 'attached_order_entry_attributes',
    joinColumn: { name: 'order_entry_id' },
    inverseJoinColumn: { name: 'attribute_id' },
  })
  attributes?: OrderEntryAttribute[];

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: false, name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Promise<Product>;

  @Column({ nullable: false, name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => OfferedService)
  @JoinColumn({ name: 'service_id' })
  service?: Promise<OfferedService>;
}
