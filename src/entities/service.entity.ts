import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('services')
export class OfferedService extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true, type: 'mediumtext' })
  description?: string;

  @Column({ nullable: false, default: 0 })
  isAdditional: boolean;

  @Column({ name: 'created_by', nullable: false })
  creatorId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
