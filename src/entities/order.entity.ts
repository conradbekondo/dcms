import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";

export enum OrderStatus { RECORDED, PENDING_PICKUP };

@Entity('orders')
export class Order extends BaseEntity {
    @Column({ nullable: false, unique: true })
    code: string;

    @Column()
    customerId: number;

    @Column({ nullable: true, type: 'mediumtext' })
    description: string;

    @Column({ nullable: false, default: OrderStatus.RECORDED })
    status: OrderStatus;
}