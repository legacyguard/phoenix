import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { GuardiansModule } from '../guardians/guardians.module';

@Module({
  imports: [GuardiansModule],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService]
})
export class UserSettingsModule {}
