import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('order_entry_attributes')
export class OrderEntryAttribute extends BaseEntity {
    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: true })
    value?: string;
}