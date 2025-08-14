import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { AssetType } from '../../../generated/prisma';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssetType)
  @IsNotEmpty()
  type: AssetType;

  @IsNumber()
  @IsPositive()
  value: number;
}
