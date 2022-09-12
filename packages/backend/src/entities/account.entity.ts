import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}