import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  @Index({ fulltext: true })
  firstName: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  lastName: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  phoneNumber: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  natId: string;

  @Column({ default: Gender.MALE })
  gender: Gender;

  @Column({ length: 500, nullable: true })
  @Index({ fulltext: true })
  notes: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  address: string;

  @OneToOne(() => User)
  user?: Promise<User>;
}
