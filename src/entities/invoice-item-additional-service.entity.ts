import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { InvoiceItem } from "./invoice-item.entity";


@Entity('invoice_item_additional_services')
export class InvoiceItemAdditionalService extends BaseEntity {

    @Column()
    invoiceId: number;

    @Column()
    invoiceItemId: number;

    @ManyToOne(() => InvoiceItem)
    invoiceItem: InvoiceItem;

    @Column()
    serviceId: number;

    @Column()
    serviceName: string;

    @Column()
    price: number;
}
