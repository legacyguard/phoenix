import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from './update-user-settings.dto';

export class UserSettingsDto {
  @ApiProperty({ example: 30 })
  heartbeatIntervalDays: number;

  @ApiProperty({ example: false })
  isHeartbeatActive: boolean;

  @ApiProperty({ example: null, nullable: true })
  lastHeartbeatAt: string | null;

  @ApiProperty({ example: ['email'], isArray: true, enum: NotificationChannel })
  notificationChannels: NotificationChannel[];
}

export class UpdateUserSettingsDocDto {
  @ApiProperty({ example: 60, required: false, minimum: 7, maximum: 365 })
  heartbeatIntervalDays?: number;

  @ApiProperty({ example: true, required: false })
  isHeartbeatActive?: boolean;

  @ApiProperty({ example: ['email'], isArray: true, required: false, enum: NotificationChannel })
  notificationChannels?: NotificationChannel[];
}

export class HeartbeatTriggerDto {
  @ApiProperty({ example: 'manual', enum: ['manual', 'auto'], required: false })
  reason?: 'manual' | 'auto';
}
