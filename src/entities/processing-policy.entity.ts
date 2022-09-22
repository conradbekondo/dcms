import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('policies')
export class Policy extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: 0, nullable: false, type: 'double' })
  servicePriceModifier: number;

  @Column({ type: 'mediumtext', nullable: true })
  description?: string;
}
