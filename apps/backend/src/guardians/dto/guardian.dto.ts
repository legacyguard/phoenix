import { ApiProperty } from '@nestjs/swagger';
import { GuardianStatus } from '../../../generated/prisma';

export class GuardianDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'John' }) firstName: string;
  @ApiProperty({ example: 'Doe' }) lastName: string;
  @ApiProperty({ example: 'john@example.com' }) email: string;
  @ApiProperty({ example: '+421900000000', required: false }) phone?: string;
  @ApiProperty({ example: 'Friend' }) relationship: string;
  @ApiProperty({ enum: GuardianStatus, enumName: 'GuardianStatus' }) status: GuardianStatus;
  @ApiProperty({ example: ['READ'], required: false, isArray: true }) accessPermissions?: any[];
  @ApiProperty({ example: '2025-08-15T11:22:33.000Z' }) createdAt: string;
  @ApiProperty({ example: '2025-08-15T11:22:33.000Z' }) updatedAt: string;
}
