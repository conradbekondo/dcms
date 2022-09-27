export class UpdateOrderInvoiceDto {
    orderId: string;
    invoiceId: string;
    clientNames?: string;
    serviceCount?: string;
    tax?: string;
    total?: string;
    netPayable?: string;
    dueDate: Date;
    paymentType: string;
    amountPaid: string;
    discount: string;
    markAsDelivered?: string;
    orderCode: string;
}