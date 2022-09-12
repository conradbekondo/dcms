import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Item } from "./item.entity";
import { OfferedService } from "./offered-service.entity";
import { OrderItemAttribute } from "./order-entry-attribute.entity";
import { OrderItemAppliedPolicy } from "./order-entry-item-applied-policy.entity";
import { Order } from "./order.entity";

@Entity('order-items')
export class OrderEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item_type' })
    itemRef: Promise<Item>;

    @Column()
    quantity: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Promise<Order>;

    @ManyToOne(() => OfferedService)
    @JoinColumn({ name: 'service_id' })
    service: Promise<OfferedService>;

    @OneToMany(() => OrderItemAppliedPolicy, o => o.orderEntry)
    appliedPolicies: Promise<OrderItemAppliedPolicy[]>;

    @OneToMany(() => OrderItemAttribute, o => o.orderEntry)
    attributes: Promise<OrderItemAttribute[]>;
}