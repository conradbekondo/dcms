import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    pricePercentage: number;

    @ManyToMany(() => Permission)
    @JoinTable({ name: 'role_permissions', joinColumn: { name: 'role_id' } })
    permissions: Promise<Permission[]>;

}