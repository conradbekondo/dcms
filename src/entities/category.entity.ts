import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('categories')
export class Category extends BaseEntity {
    @Column({ nullable: false, unique: true })
    name: string;

    @Column({ nullable: true, type: 'mediumtext' })
    description?: string;
}
