import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Evidence')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned upload URL for evidence' })
  async getUploadUrl(@Body('fileName') fileName: string, @Body('mimeType') mimeType: string) {
    return this.service.getUploadUrl(fileName, mimeType);
  }

  @Post()
  @Audit({ entityType: 'Evidence', action: 'CREATE' })
  @ApiOperation({ summary: 'Create an evidence record' })
  async create(@Body() dto: CreateEvidenceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List evidence' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence metadata' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get presigned download URL for evidence' })
  async getDownloadUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getDownloadUrl(id);
  }

  @Delete(':id')
  @Audit({ entityType: 'Evidence', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete evidence' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }
}
