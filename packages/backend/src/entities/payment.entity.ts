import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { PaymentStatus } from "./payment-status";
import { Transaction } from "./transaction.entity";
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

    @OneToMany(() => Transaction, t => t.payment)
    transactions: Promise<Transaction[]>;
}