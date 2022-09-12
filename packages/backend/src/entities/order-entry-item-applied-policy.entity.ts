import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { OrderEntry } from "./order-entry.entity";

@Entity('order_item_applied_policies')
export class OrderItemAppliedPolicy {
    @PrimaryColumn()
    orderItem: number;

    @ManyToOne(() => OrderEntry)
    @JoinColumn({ name: 'order_item' })
    orderEntry: Promise<OrderEntry>;

    @Column()
    pricePercentage: number;
}