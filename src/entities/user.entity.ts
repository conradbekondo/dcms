import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Profile } from "./profile.entity";
import { Role } from "./Role";

@Entity('users')
export class User extends BaseEntity {
    @Column({ nullable: false, unique: true })
    username: string;

    @Column({ nullable: false, length: 255 })
    passwordHash: string;

    @Column({ default: false })
    isLocked: boolean;

    @ManyToMany(() => Role, { eager: true })
    @JoinTable({ name: 'user_roles', joinColumn: { name: 'user_id' }, inverseJoinColumn: { name: 'role_id' } })
    roles: Role[];

    @Column({ name: 'profile_id' })
    profileId: number;

    @OneToOne(() => Profile, { eager: true })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;
}
