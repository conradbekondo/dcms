import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductServicePrice } from "./product-service-price.entity";

@Entity('products')
export class Product extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true, type: 'mediumtext' })
    description?: string;

    @Column({ nullable: true })
    iconUrl?: string;

    @OneToMany(() => ProductServicePrice, p => p.product)
    servicePrices: Promise<ProductServicePrice[]>;
}