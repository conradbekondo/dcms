import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Gender } from "src/entities/profile.entity";
import { Roles } from "src/entities/roles";

export class INewUserDto {
  @IsNotEmpty({ always: true, message: '"First name" is required for system user' })
  @IsString()
  firstName: string;

  @IsString({ message: '"Last name" needs to be a string value' })
  @IsOptional()
  lastName?: string;

  @Matches(/^(((((\+?237)|(\(\+?237\))))\s?)?(([697])|(2))\d{8})$/gm, { message: 'Invalid "Phone number"' })
  @IsNotEmpty({ always: true, message: '"Phone number" is required' })
  @IsString({ message: '"Phone number" needs to be a string' })
  phoneNumber?: string;

  @IsEnum(Roles, { message: 'Invalid value for "Role"' })
  @IsString({ message: '"Role" needs to be a string' })
  @IsOptional()
  role: string;

  @IsNotEmpty({ always: true, message: '"Username" for new user is required' })
  @IsString({ message: '"Username" needs to be a string' })
  username?: string;

  @IsString({ message: '"Address" needs to be a string' })
  @IsOptional()
  address?: string;

  @IsEnum(Gender)
  gender?: 0 | 1;

  @IsOptional()
  @IsString({ message: '"Notes" needs to be a string' })
  notes?: string;

  @Matches(/^\d{$/gm, { message: 'Invalid "National ID"' })
  @IsString({ message: '"National ID" needs to be a string' })
  natId?: string;

  @IsNotEmpty({ always: true, message: '"Password" is required' })
  @IsString({ message: '"Password" needs to be a string' })
  @MinLength(6, { message: '"Password" must have at least 6 characters' })
  @MaxLength(100, { message: '"Password" can have at most 100 characters' })
  password?: string;

  @Matches('password')
  @IsString({ message: '"Confirm Password" needs to be a string' })
  confirmPassword?: string;
}
