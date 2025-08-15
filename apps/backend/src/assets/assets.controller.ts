import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors, BadRequestException, HttpCode, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator';
import { ApiPaginatedOkResponse } from '../common/decorators/api-paginated-ok-response.decorator';
import { AssetDto, AssetAttachmentDto } from './dto/asset.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Assets')
@ApiBearerAuth('bearer')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Vytvoriť aktívum' })
  @ApiCreatedResponse({ type: AssetDto })
  @ApiErrorResponses()
  create(@Body() createAssetDto: CreateAssetDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.create(createAssetDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Zoznam aktív' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (1-indexed)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page (max 100)' })
  @ApiPaginatedOkResponse(AssetDto)
  @ApiErrorResponses()
  findAll(@Req() req: Request, @Query('page') page?: number, @Query('limit') limit?: number) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.findAll(userId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail aktíva' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AssetDto })
  @ApiErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualizovať aktívum' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: AssetDto })
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.update(id, updateAssetDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Zmazať aktívum' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Vymazané' })
  @ApiErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.remove(id, userId);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Nahrať prílohu k aktívu' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiCreatedResponse({ type: AssetAttachmentDto })
  @ApiErrorResponses()
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

  @Delete(':assetId/attachments/:attachmentId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Zmazať prílohu aktíva' })
  @ApiParam({ name: 'assetId', format: 'uuid' })
  @ApiParam({ name: 'attachmentId', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Vymazané' })
  @ApiErrorResponses()
  deleteAttachment(
    @Param('assetId') assetId: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.deleteAttachment(userId, assetId, attachmentId);
  }

  @Get(':assetId/attachments/:attachmentId/download-url')
  @ApiOperation({ summary: 'Získať podpísanú URL pre stiahnutie prílohy' })
  @ApiParam({ name: 'assetId', format: 'uuid' })
  @ApiParam({ name: 'attachmentId', format: 'uuid' })
  @ApiOkResponse({ schema: { properties: { downloadUrl: { type: 'string', example: 'https://...' } } } })
  @ApiErrorResponses()
  getAttachmentDownloadUrl(
    @Param('assetId') assetId: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.assetsService.getAttachmentDownloadUrl(userId, assetId, attachmentId);
  }
}
