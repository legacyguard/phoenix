import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto, userId: string) {
    const { name, description, type, value } = createAssetDto;
    return this.prisma.asset.create({
      data: {
        name,
        description,
        type,
        value,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.asset.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, userId } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Asset not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    return this.prisma.asset.update({ where: { id }, data: updateAssetDto });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.asset.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Asset not found');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    await this.prisma.asset.delete({ where: { id } });
    return { success: true };
  }
}
