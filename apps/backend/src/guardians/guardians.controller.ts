import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Query } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNoContentResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ApiErrorResponses } from '../common/decorators/api-error-responses.decorator';
import { ApiPaginatedOkResponse } from '../common/decorators/api-paginated-ok-response.decorator';
import { GuardianDto } from './dto/guardian.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('Guardians')
@ApiBearerAuth('bearer')
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @ApiOperation({ summary: 'Vytvoriť guardiana' })
  @ApiCreatedResponse({ type: GuardianDto })
  @ApiErrorResponses()
  create(@Body() createGuardianDto: CreateGuardianDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.guardiansService.create(createGuardianDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Zoznam guardians' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (1-indexed)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page (max 100)' })
  @ApiPaginatedOkResponse(GuardianDto)
  @ApiErrorResponses()
  findAll(@Req() req: Request, @Query('page') page?: number, @Query('limit') limit?: number) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.guardiansService.findAll(userId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail guardiana' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: GuardianDto })
  @ApiErrorResponses()
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.guardiansService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aktualizovať guardiana' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: GuardianDto })
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() updateGuardianDto: UpdateGuardianDto, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.guardiansService.update(id, updateGuardianDto, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Zmazať guardiana' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Vymazané' })
  @ApiErrorResponses()
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id ?? (req.user as any)?.sub;
    return this.guardiansService.remove(id, userId);
  }
}
