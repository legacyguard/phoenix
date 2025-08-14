import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

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
}
