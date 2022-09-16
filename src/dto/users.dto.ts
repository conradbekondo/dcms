export interface IUsersDto {
  first_name: string;
  last_name?: string;
  phoneNumber: string;
  role: string;
  username?: string;
  address?: string;
  gender?: 0|1;
  notes?: string;
  natId?: string;
  password?: string;
  confirmPassword?: string;
}