import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ nullable: false, unique: true })
  roleName: string;

  @ManyToMany(() => User)
  // @JoinTable({ name: 'user_roles', joinColumn: { name: 'role_id' }, inverseJoinColumn: { name: 'user_id' } })
  members: Promise<User[]>;
}
