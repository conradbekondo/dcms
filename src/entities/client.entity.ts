import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: false, unique: true })
  phone: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: false })
  address: string;
}
