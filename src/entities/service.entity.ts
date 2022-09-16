import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('services')
export class OfferedService extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true, type: 'mediumtext' })
  description?: string;

  @Column({ default: 0, type: 'double' })
  standardPrice: number;

  @Column({ nullable: true, type: 'double', default: 1 })
  processingDuration?: number;
}
