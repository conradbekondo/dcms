import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('permissions')
export class Permission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    permissionName: string;

    @Column()
    shortDescription?: string;

    @Column()
    longDescription?: string;
}