import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { ProductServicePrice } from './product-service-price.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'category_id', nullable: false })
  categoryId: number;

  @Column({ nullable: true, type: 'mediumtext' })
  description?: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @OneToMany(() => ProductServicePrice, (p) => p.productId)
  @JoinTable({
    name: 'product_prices',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'id' },
  })
  servicePrices: Promise<ProductServicePrice[]>;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
