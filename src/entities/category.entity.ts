import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Product } from "./product.entity";

@Entity('categories')
export class Category extends BaseEntity {
    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: true, type: 'mediumtext' })
    description?: string;
    @OneToMany(() => Product, p => p.category)
    products: Promise<Product[]>
}
