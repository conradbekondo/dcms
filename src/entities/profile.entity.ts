import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum Gender {
  MALE,
  FEMALE,
  UNKNOWN,
}

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  natId: string;

  @Column({ default: Gender.MALE })
  gender: Gender;

  @Column({ length: 500, nullable: true })
  notes: string;

  @Column({ nullable: true })
  address: string;

  @OneToOne(() => User)
  user?: Promise<User>;
}
