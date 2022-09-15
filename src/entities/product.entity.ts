import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('products')
export class Product extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true, type: 'mediumtext' })
    description?: string;

    @Column({ nullable: true })
    iconUrl?: string;
}