import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGuardianDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;
}
