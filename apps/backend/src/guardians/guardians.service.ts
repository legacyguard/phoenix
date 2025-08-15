import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGuardianDto: CreateGuardianDto, userId: string) {
    try {
      return await this.prisma.guardian.create({
        data: {
          userId,
          ...createGuardianDto,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Guardian with this email already exists for this user.');
      }
      throw error;
    }
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const take = Math.max(1, Math.min(100, Number(limit) || 10));
    const currentPage = Math.max(1, Number(page) || 1);
    const skip = (currentPage - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.guardian.findMany({ where: { userId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.guardian.count({ where: { userId } }),
    ]);

    return { items, page: currentPage, limit: take, total };
  }

  async findOne(id: string, userId: string) {
    const guardian = await this.prisma.guardian.findFirst({ where: { id, userId } });
    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }
    return guardian;
  }

  async update(id: string, updateGuardianDto: UpdateGuardianDto, userId: string) {
    await this.findOne(id, userId);
    return await this.prisma.guardian.update({ where: { id }, data: updateGuardianDto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.guardian.delete({ where: { id } });
    return { success: true };
  }
}
