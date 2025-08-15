import { IsInt, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddHeartbeatGuardianDto {
  // Guardian IDs are cuid strings in our schema, not UUIDs
  @ApiProperty({ example: 'cku6l6xhc0000q5l5zj9m1xyz', description: 'ID of the guardian to assign' })
  @IsString()
  guardianId: string;

  @ApiProperty({ example: 1, description: 'Order in which the guardian should be contacted (1 is highest priority)' })
  @IsInt()
  @Min(1)
  priority: number;
}
