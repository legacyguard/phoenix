import { IsBoolean, IsInt, IsOptional, Min, Max, IsArray, IsEnum } from 'class-validator';

export enum NotificationChannel {
  EMAIL = 'email',
  // V budúcnosti môžeme pridať SMS = 'sms'
}

export class UpdateUserSettingsDto {
  @IsInt()
  @Min(7)
  @Max(365)
  @IsOptional()
  heartbeatIntervalDays?: number;

  @IsBoolean()
  @IsOptional()
  isHeartbeatActive?: boolean;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  notificationChannels?: NotificationChannel[];
}


