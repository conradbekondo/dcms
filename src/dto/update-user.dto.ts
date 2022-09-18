import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty({ always: true, message: '"First Name" is required' })
    @IsString()
    firstName: string;

    @IsString({ message: '"Last name" needs to be a string value' })
    @IsOptional()
    lastName: string;

    @IsNumberString()
    gender: string;

    @IsNotEmpty({ message: '"National ID" is required' })
    @IsNumberString({ message: '"National ID" is invalid' })
    natId: string;

    @IsNumberString({ message: '"Phone number" is invalid' })
    phone: string;

    @IsOptional()
    address: string;

    @IsString({ message: '"Role" needs to be a string' })
    @IsOptional()
    role: 'admin' | 'staff';

    @IsNumber()
    id: number;
}