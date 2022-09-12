import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntry } from "./order-entry.entity";

@Entity('order_item_attributes')
export class OrderItemAttribute {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    value: string;

    @ManyToOne(() => OrderEntry)
    @JoinColumn({ name: 'order_item' })
    orderEntry: Promise<OrderEntry>;
}