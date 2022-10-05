export interface IClientDto {
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  address: string;
}

export class NewClientDto implements IClientDto {
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  address: string;
}
