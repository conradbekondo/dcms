import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('services')
export class OfferedService extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true, type: 'mediumtext' })
    description?: string;

    @Column({ nullable: false, default: 0 })
    isAdditional: boolean;
}
