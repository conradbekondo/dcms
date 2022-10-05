import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Client } from './client.entity';
import { Invoice } from './invoice.entity';
import { OrderEntry } from './order-entry.entity';
import { User } from './user.entity';

export enum OrderStatus {
  RECORDED,
  PENDING_PICKUP,
  DELIVERED,
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ nullable: false, unique: true })
  @Index({ fulltext: true })
  code: string;

  @Column()
  customerId: number;

  @ManyToOne(() => Client, { eager: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Client;

  @Column({ nullable: true, type: 'mediumtext' })
  @Index({ fulltext: true })
  description: string;

  @Column({ nullable: false, default: OrderStatus.RECORDED })
  status: OrderStatus;

  @Column({ nullable: false })
  dueDate: Date;

  @Column({ nullable: false, name: 'recorder_id' })
  recorderId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'recorder_id' })
  recordedBy: User;

  @OneToMany(() => OrderEntry, (e) => e.order, { eager: false })
  entries: OrderEntry[];

  @OneToOne(() => Invoice, (invoice) => invoice.order, {
    eager: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  invoice: Invoice;
}
