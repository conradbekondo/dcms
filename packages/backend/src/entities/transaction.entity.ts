import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./account.entity";
import { Payment } from "./payment.entity";

@Entity('payment_transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value: number;

    @ManyToOne(() => Payment)
    @JoinColumn({ name: 'payment_id' })
    payment: Promise<Payment>;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'src_account' })
    srcAccount: Promise<Account>;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'dest_account' })
    destAccount: Promise<Account>;
}