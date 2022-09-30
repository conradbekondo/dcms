import { DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { Client } from './client.entity';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { Order, OrderStatus } from './order.entity';
import { Profile } from './profile.entity';
import { User } from './user.entity';


@ViewEntity({
    name: 'vw_orders',
    expression: (datasource: DataSource) => {
        return datasource
            .createQueryBuilder()
            .select('o.id', 'order_id')
            .addSelect('o.code', 'code')
            .addSelect(`trim(concat(c.first_name, ' ', coalesce(c.last_name, '')))`, 'customer')
            .addSelect('(select (select count(*) from invoice_item_additional_services iias where iias.invoice_id = i.id)+1)', 'number_of_services')
            .addSelect('(select (select count(oe.quantity) from order_entries oe where oe.order_id = o.id))', 'number_of_entries')
            .addSelect(`coalesce(o.description, 'N / A')`, 'description')
            .addSelect('i.tax', 'tax')
            .addSelect('i.discount', 'discount')
            .addSelect('i.total', 'total')
            .addSelect('i.net_payable', 'net_payable')
            .addSelect('i.amount_paid', 'amount_paid')
            .addSelect('i.balance', 'balance')
            .addSelect('i.status', 'invoice_status')
            .addSelect('o.status', 'order_status')
            .addSelect('i.date_created', 'date_recorded')
            .addSelect('i.due_date', 'due_date')
            .addSelect('u.id', 'recorder_id')
            .addSelect(`trim(concat(p.first_name, ' ', coalesce(p.last_name, '')))`, 'recorded_by')
            .from(Invoice, 'i')
            .innerJoin(Order, 'o', 'i.order_id = o.id')
            .innerJoin(Client, 'c', 'c.id = o.customer_id')
            .leftJoin(User, 'u', 'u.id = i.recorded_by_id')
            .leftJoin(Profile, 'p', 'p.id = u.profile_id')
            .orderBy('date_recorded', 'DESC');
    }
})
export class OrdersView {
    @ViewColumn() orderId?: number;
    @ViewColumn() code?: string;
    @ViewColumn() customer?: string;
    @ViewColumn() numberOfServices: number;
    @ViewColumn() numberOfEntries: number;
    @ViewColumn() description?: string;
    @ViewColumn() tax: number;
    @ViewColumn() discount: number;
    @ViewColumn() total: number;
    @ViewColumn() netPayable: number;
    @ViewColumn() amountPaid: number;
    @ViewColumn() balance: number;
    @ViewColumn() invoiceStatus: InvoiceStatus;
    @ViewColumn() orderStatus: OrderStatus;
    @ViewColumn() dateRecorded: Date;
    @ViewColumn() dueDate: Date;
    @ViewColumn() recordedBy: string;
    @ViewColumn({ name: 'recorder_id' }) recorderId: number;
}
