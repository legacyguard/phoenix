import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.create(createAssetDto, userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.update(id, updateAssetDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.remove(id, userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadAttachment(
    @Param('id') assetId: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.assetsService.addAttachment(userId, assetId, file);
  }
}
