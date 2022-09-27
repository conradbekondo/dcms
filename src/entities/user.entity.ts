import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Profile } from './profile.entity';
import { Role } from './Role';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, length: 255 })
  @Exclude({ toPlainOnly: true })
  passwordHash: string;

  @Column({ default: false })
  isLocked: boolean;

  @ManyToMany(() => Role, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @Column({ name: 'profile_id' })
  profileId: number;

  @OneToOne(() => Profile, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column({ nullable: true, name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creator_id' })
  creator?: User;
}
