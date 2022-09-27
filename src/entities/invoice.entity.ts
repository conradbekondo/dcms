import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { Order } from "./order.entity";
import { User } from "./user.entity";

export enum InvoiceStatus {
    PAID, UNPAID, PARTIALLY_PAID
}

@Entity('invoices')
export class Invoice extends BaseEntity {
    @Column({ nullable: false })
    orderId: number;

    @OneToOne(() => Order, order => order.invoice, { eager: false })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column()
    total: number;

    @Column()
    netPayable: number;

    @Column({ nullable: true })
    paymentType: string;

    @Column()
    amountPaid: number;

    @Column()
    balance: number;

    @Column()
    recordedById: number;

    @Column()
    tax: number;

    @Column()
    discount: number;

    @ManyToOne(() => User, { eager: false })
    @JoinColumn({ name: 'recorded_by_id' })
    recordedBy: User;

    @Column()
    status: InvoiceStatus;

    @OneToMany(() => InvoiceItem, item => item.invoice, { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinTable({ name: 'invoice_items', joinColumn: { name: 'invoice_id' }, inverseJoinColumn: { name: 'id' } })
    items: InvoiceItem[];

    @Column()
    dueDate: Date;
}

