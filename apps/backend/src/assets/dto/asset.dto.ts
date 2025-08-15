import { ApiProperty } from '@nestjs/swagger';
import { AssetType } from '../../../generated/prisma';

export class AssetDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'Byt v centre' }) name: string;
  @ApiProperty({ example: '3-izbový byt', required: false }) description?: string;
  @ApiProperty({ enum: AssetType, enumName: 'AssetType' }) type: AssetType;
  @ApiProperty({ example: 250000 }) value: number;
  @ApiProperty({ example: '2025-08-15T11:22:33.000Z' }) createdAt: string;
  @ApiProperty({ example: '2025-08-15T11:22:33.000Z' }) updatedAt: string;
}

export class AssetAttachmentDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) assetId: string;
  @ApiProperty({ example: 'user/asset/file.pdf' }) filePath: string;
  @ApiProperty({ example: 'doklad.pdf' }) fileName: string;
  @ApiProperty({ example: 'application/pdf' }) fileType: string;
  @ApiProperty({ example: 123456 }) fileSize: number;
  @ApiProperty({ example: '2025-08-15T11:22:33.000Z' }) createdAt: string;
}
