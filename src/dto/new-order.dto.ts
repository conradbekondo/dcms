export class NewOrderDto {
  orderEntries: {
    color: string;
    productId: string;
    serviceId: string;
    quantity: string;
    priceMode: string;
    additionalServices: { id: string }[];
  }[];
  clientId: string;
  paymentType: string;
  amountPaid: string;
  tax: string;
  discount: string;
  dueDate: string;
  color: string;
}
