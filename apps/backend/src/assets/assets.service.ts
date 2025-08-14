import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

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

  async addAttachment(userId: string, assetId: string, file: Express.Multer.File) {
    // Ownership check
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    if (asset.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    const extMatch = file.originalname.match(/\.[A-Za-z0-9]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : '';
    const uniqueName = `${randomUUID()}${ext}`;
    const path = `${userId}/${assetId}/${uniqueName}`;

    // In test environment, skip real upload to external storage
    if (process.env.NODE_ENV !== 'test') {
      const storage = this.supabase.getStorageClient();
      const { error: uploadError } = await storage
        .from('asset-attachments')
        // Supabase expects Blob | File | ArrayBuffer so convert Buffer to Uint8Array
        .upload(path, new Uint8Array(file.buffer), {
          contentType: file.mimetype,
          upsert: false,
        });
      if (uploadError) {
        throw new NotFoundException(`Upload failed: ${uploadError.message}`);
      }
    }

    const attachment = await this.prisma.assetAttachment.create({
      data: {
        assetId,
        filePath: path,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
    return attachment;
  }
}
