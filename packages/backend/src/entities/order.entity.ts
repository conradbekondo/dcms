import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderStatus } from "./order-status";
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
}