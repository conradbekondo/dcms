import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Product } from "./product.entity";
import { OfferedService } from "./service.entity";

@Entity('product_prices')
export class ProductServicePrice extends BaseEntity {
    @Column({ name: 'product_id', nullable: false })
    productId: number;

    @Column({ name: 'service_id', nullable: false })
    serviceId: number;

    @Column({ type: 'double', nullable: false, default: 0 })
    normalPrice: number;

    @Column({ type: 'double', nullable: true, default: 0 })
    fastPrice: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Promise<Product>;

    @ManyToOne(() => OfferedService)
    @JoinColumn({ name: 'service_id' })
    service: Promise<OfferedService>;
}