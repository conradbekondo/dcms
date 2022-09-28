import { Column, Entity, JoinTable, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Invoice } from "./invoice.entity";
import { InvoiceItemAdditionalService } from "./invoice-item-additional-service.entity";


@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
    @Column()
    invoiceId: number;

    @ManyToOne(() => Invoice, { eager: false })
    invoice: Invoice;

    @Column()
    productId: number;

    @Column()
    serviceId: number;

    @Column()
    priceMode: string;

    @Column()
    productName: string;

    @Column()
    serviceName: string;

    @OneToMany(() => InvoiceItemAdditionalService, s => s.invoiceItem, { eager: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinTable({ name: 'invoice_additional_services', inverseJoinColumn: { name: 'id' }, joinColumn: { name: 'invoice_item_id' } })
    additionalServices: InvoiceItemAdditionalService[];

    @Column({ default: 1 })
    quantity: number
}
