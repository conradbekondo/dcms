import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntry } from "./order-entry.entity";
import { OrderStatus } from "./order-status";
import { Payment } from "./payment.entity";
import { Profile } from "./profile.entity";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    dueDate: Date;

    @Column()
    status: OrderStatus;

    @Column()
    notes: string;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: 'customer_id' })
    customer: Promise<Profile>;

    @OneToMany(() => OrderEntry, oe => oe.order)
    entries: Promise<OrderEntry[]>;

    @OneToOne(() => Payment)
    payment?: Promise<Payment>;
}