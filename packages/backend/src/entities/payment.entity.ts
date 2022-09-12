import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { PaymentStatus } from "./payment-status";
import { User } from "./user.entity";

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: PaymentStatus;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'recorded_by' })
    recordedBy: Promise<User>;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'processed_by' })
    processedBy?: Promise<User>;

    @Column()
    dateRecorded?: Date;

    @Column()
    dateProcessed: Date;

    @Column()
    dateCanceled?: Date;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order?: Promise<Order>;

    @Column()
    price: number;
}