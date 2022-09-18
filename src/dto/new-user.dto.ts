import { IsNotEmpty, IsNumberString, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { IsEqualTo } from "src/decorators/validators/is-equal-to.decorator";
import { Gender } from "src/entities/profile.entity";

export class INewUserDto {
  @IsNotEmpty({ always: true, message: '"First name" is required for system user' })
  @IsString()
  firstName: string;

  @IsString({ message: '"Last name" needs to be a string value' })
  @IsOptional()
  lastName?: string;

  /* @Matches(/^(((((\+?237)|(\(\+?237\))))\s?)?(([697])|(2))\d{8})$/gm, { message: 'Invalid "Phone number"' })
  @IsNotEmpty({ always: true, message: '"Phone number" is required' }) */
  // @IsString({ message: '"Phone number" needs to be a string' })
  @IsNumberString({ message: '"Phone number" is required' })
  phoneNumber: string;

  @IsString({ message: '"Role" needs to be a string' })
  @IsOptional()
  role: 'admin' | 'staff';

  @IsNotEmpty({ always: true, message: '"Username" for new user is required' })
  @IsString({ message: '"Username" needs to be a string' })
  username?: string;

  @IsString({ message: '"Address" needs to be a string' })
  @IsOptional()
  address?: string;

  @IsNumberString()
  gender?: Gender;

  @IsOptional()
  @IsString({ message: '"Notes" needs to be a string' })
  notes?: string;

  @IsNotEmpty({ message: '"National ID" is required' })
  @IsNumberString({ message: '"National ID" is invalid' })
  natId?: string;

  @IsNotEmpty({ always: true, message: '"Password" is required' })
  @IsString({ message: '"Password" needs to be a string' })
  @MinLength(6, { message: '"Password" must have at least 6 characters' })
  @MaxLength(100, { message: '"Password" can have at most 100 characters' })
  password?: string;

  @IsEqualTo('password')
  @IsString({ message: '"Confirm Password" needs to be a string' })
  confirmPassword?: string;
}
