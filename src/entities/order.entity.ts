import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderEntry } from './order-entry.entity';
import { User } from './user.entity';

export enum OrderStatus {
  RECORDED,
  PENDING_PICKUP,
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ nullable: false, unique: true })
  code: string;

  @Column()
  customerId: number;

  @Column({ nullable: true, type: 'mediumtext' })
  description: string;

  @Column({ nullable: false, default: OrderStatus.RECORDED })
  status: OrderStatus;

  @Column({ nullable: false })
  dueDate: Date;

  @Column({ nullable: false, name: 'recorder_id' })
  recorderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorder_id' })
  recordedBy: Promise<User>;

  @OneToMany(() => OrderEntry, (e) => e.order)
  entries: Promise<OrderEntry[]>;
}
