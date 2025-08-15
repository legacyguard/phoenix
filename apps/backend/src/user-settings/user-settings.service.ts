import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { AddHeartbeatGuardianDto } from './dto/add-heartbeat-guardian.dto';
import { GuardiansService } from '../guardians/guardians.service';

@Injectable()
export class UserSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guardiansService: GuardiansService,
  ) {}

  async createDefaultSettings(userId: string) {
    return this.prisma.userSettings.create({
      data: {
        userId,
        heartbeatIntervalDays: 30,
        isHeartbeatActive: false,
        notificationChannels: ['email'],
      },
    });
  }

  async getSettings(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException('User settings not found.');
    }

    return settings;
  }

  async updateSettings(userId: string, updateUserSettingsDto: UpdateUserSettingsDto) {
    const settings = await this.getSettings(userId);

    return this.prisma.userSettings.update({
      where: { userId },
      data: updateUserSettingsDto,
    });
  }

  async recordHeartbeat(userId: string) {
    const settings = await this.getSettings(userId);

    if (!settings.isHeartbeatActive) {
      throw new BadRequestException('Heart-Beat protocol is not active for this user.');
    }

    await this.prisma.userSettings.update({
      where: { userId },
      data: { lastHeartbeatAt: new Date() },
    });
  }

  async addHeartbeatGuardian(userId: string, dto: AddHeartbeatGuardianDto) {
    // Ensure settings exist and belong to user
    const settings = await this.getSettings(userId);

    // Validate guardian ownership
    const guardian = await this.prisma.guardian.findUnique({ where: { id: dto.guardianId } });
    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }
    if (guardian.userId !== userId) {
      throw new ForbiddenException('You do not have access to this guardian.');
    }

    try {
      await this.prisma.heartbeatGuardianLink.create({
        data: {
          userSettingsId: settings.id,
          guardianId: dto.guardianId,
          priority: dto.priority,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target: string[] | undefined = error?.meta?.target;
        if (Array.isArray(target)) {
          if (target.includes('priority')) {
            throw new ConflictException('Priority already in use.');
          }
          if (target.includes('guardianId')) {
            throw new ConflictException('Guardian is already assigned.');
          }
        }
        // Fallback generic conflict
        throw new ConflictException('Unique constraint violation.');
      }
      throw error;
    }
  }

  async listHeartbeatGuardians(userId: string) {
    const settings = await this.getSettings(userId);
    const links = await this.prisma.heartbeatGuardianLink.findMany({
      where: { userSettingsId: settings.id },
      include: {
        guardian: true,
      },
      orderBy: { priority: 'asc' },
    });

    return links.map((link) => ({
      priority: link.priority,
      guardian: {
        id: link.guardian.id,
        firstName: link.guardian.firstName,
        lastName: link.guardian.lastName,
        email: link.guardian.email,
        relationship: link.guardian.relationship,
      },
    }));
  }

  async removeHeartbeatGuardian(userId: string, guardianId: string) {
    const settings = await this.getSettings(userId);
    await this.prisma.heartbeatGuardianLink.deleteMany({
      where: {
        userSettingsId: settings.id,
        guardianId,
      },
    });
  }
}
