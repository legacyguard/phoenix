import { ApiProperty } from '@nestjs/swagger';

export class ProblemDetailsDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string | string[];

  @ApiProperty({ example: 'USR_001', required: false })
  code?: string;

  @ApiProperty({ example: '/user-settings/heartbeat-guardians', required: false })
  path?: string;

  @ApiProperty({ example: new Date().toISOString(), required: false })
  timestamp?: string;
}
