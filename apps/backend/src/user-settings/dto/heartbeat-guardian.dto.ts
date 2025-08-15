import { ApiProperty } from '@nestjs/swagger';

// DTO pre vnorený objekt opatrovníka
class GuardianDetailsDto {
  @ApiProperty({ example: 'cku6l6xhc0000q5l5zj9m1xyz' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'Friend' })
  relationship: string;
}

// Hlavné DTO pre položku v zozname
export class HeartbeatGuardianResponseDto {
  @ApiProperty({ example: 1 })
  priority: number;

  @ApiProperty({ type: GuardianDetailsDto })
  guardian: GuardianDetailsDto;
}
