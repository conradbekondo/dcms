import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Role } from "./Role";

@Entity('users')
export class User extends BaseEntity {
    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: false, length: 255 })
    passwordHash: string;

    @Column({ default: true })
    isLocked: boolean;

    @ManyToMany(() => Role)
    // @JoinTable({ name: 'user_roles', joinColumn: { name: 'user_id' } })
    roles: Promise<Role[]>;
}

