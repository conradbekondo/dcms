import { Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { Profile } from "./profile.entity";
import { Role } from "./role.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    passwordHash: string;

    @Column()
    isActive: boolean;

    @Column()
    isLocked: boolean;

    @OneToOne(() => Profile, { lazy: false })
    profile: Profile;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable({ name: 'user_roles', joinColumn: { name: 'user_id' } })
    roles: Role[];

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable({ name: 'user_granted_permissions', joinColumn: { name: 'user_id' } })
    grantedPermissions: Permission[];
}

