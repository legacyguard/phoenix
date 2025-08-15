import { Controller, Get, Patch, Body, UseGuards, Req, HttpCode, Post, Delete, Param } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { AddHeartbeatGuardianDto } from './dto/add-heartbeat-guardian.dto';
import { HeartbeatGuardianResponseDto } from './dto/heartbeat-guardian.dto';
import { UserSettingsDto, UpdateUserSettingsDocDto, HeartbeatTriggerDto } from './dto/user-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiOkResponse, ApiNoContentResponse, ApiParam } from '@nestjs/swagger';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator';

@UseGuards(JwtAuthGuard)
@ApiTags('User Settings')
@ApiBearerAuth('bearer')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Prečítať nastavenia používateľa' })
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiErrorResponses()
  getSettings(@Req() req: any) {
    const userId = req.user.id;
    return this.userSettingsService.getSettings(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Upraviť nastavenia používateľa' })
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiErrorResponses()
  updateSettings(@Body() updateUserSettingsDto: UpdateUserSettingsDocDto, @Req() req: any) {
    const userId = req.user.id;
    return this.userSettingsService.updateSettings(userId, updateUserSettingsDto);
  }

  @Post('heartbeat')
  @HttpCode(204)
  @ApiOperation({ summary: 'Vyvolať heartbeat ping' })
  @ApiNoContentResponse({ description: 'Heartbeat spustený' })
  @ApiErrorResponses()
  recordHeartbeat(@Req() req: any, @Body() _dto?: HeartbeatTriggerDto) {
    const userId = req.user.id;
    return this.userSettingsService.recordHeartbeat(userId);
  }

  @Get('heartbeat-guardians')
  @ApiOperation({ summary: 'List all guardians assigned to the Heart-Beat protocol' })
  @ApiOkResponse({ description: 'Success', type: HeartbeatGuardianResponseDto, isArray: true })
  @ApiErrorResponses()
  listHeartbeatGuardians(@Req() req: any) {
    const userId = req.user.id;
    return this.userSettingsService.listHeartbeatGuardians(userId);
  }

  @Post('heartbeat-guardians')
  @HttpCode(204)
  @ApiOperation({ summary: 'Assign a guardian to the Heart-Beat protocol with a specific priority' })
  @ApiNoContentResponse({ description: 'Assigned successfully' })
  @ApiErrorResponses()
  async addHeartbeatGuardian(@Body() dto: AddHeartbeatGuardianDto, @Req() req: any) {
    const userId = req.user.id;
    await this.userSettingsService.addHeartbeatGuardian(userId, dto);
  }

  @Delete('heartbeat-guardians/:guardianId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a guardian from the Heart-Beat protocol' })
  @ApiParam({ name: 'guardianId', example: 'cku6l6xhc0000q5l5zj9m1xyz', description: 'Guardian ID (cuid)' })
  @ApiNoContentResponse({ description: 'Removed successfully or no-op' })
  @ApiErrorResponses()
  async removeHeartbeatGuardian(@Param('guardianId') guardianId: string, @Req() req: any) {
    const userId = req.user.id;
    await this.userSettingsService.removeHeartbeatGuardian(userId, guardianId);
  }
}


