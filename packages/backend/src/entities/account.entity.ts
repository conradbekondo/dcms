import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./transaction.entity";

@Entity('accounts')
export class Account {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    initialBalance: number;

    @OneToMany(() => Transaction, t => t.destAccount)
    incomingTransactions: Promise<Transaction[]>;

    @OneToMany(() => Transaction, t => t.srcAccount)
    outgoingTransactions: Promise<Transaction[]>;
}