import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @Column({ nullable: false })
  @Index({ fulltext: true })
  first_name: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  last_name: string;

  @Column({ nullable: false, unique: true })
  @Index({ fulltext: true })
  phone: string;

  @Column({ nullable: true })
  @Index({ fulltext: true })
  email: string;

  @Column({ nullable: false })
  @Index({ fulltext: true })
  address: string;/* 

  @Column({ nullable: true })
  addedById: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'added_by_id' })
  addedBy: User; */
}
