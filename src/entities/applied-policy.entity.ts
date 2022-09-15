import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderEntry } from "./order-entry.entity";
import { Policy } from "./processing-policy.entity";

@Entity('order_entry_applied_policies')
export class AppliedPolicy extends BaseEntity {
    @Column({ name: 'policy_id' })
    policyId: number;

    @Column({ name: 'order_entry_id', nullable: false })
    orderEntryId: number;

    @ManyToOne(() => OrderEntry)
    @JoinColumn({ name: 'order_entry_id' })
    orderEntry: Promise<OrderEntry>;

    @ManyToOne(() => Policy)
    @JoinColumn({ name: 'policy_id' })
    policy: Promise<Policy>;

    @Column({ nullable: false, type: 'double' })
    priceModifier: number
}