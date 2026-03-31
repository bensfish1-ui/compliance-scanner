import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Risks')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('risks')
export class RisksController {
  constructor(private readonly service: RisksService) {}

  @Post()
  @Audit({ entityType: 'Risk', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new risk' })
  async create(@Body() dto: CreateRiskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List risks' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get risk matrix data (5x5 grid)' })
  async getRiskMatrix() {
    return this.service.getRiskMatrixData();
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get risk heatmap data grouped by category' })
  async getHeatmap() {
    return this.service.getHeatmapData();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get risk details with controls' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'Risk', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a risk' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateRiskDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'Risk', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a risk' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }

  @Post(':id/controls/:controlId')
  @ApiOperation({ summary: 'Map a control to this risk' })
  async addControl(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('controlId', ParseUUIDPipe) controlId: string,
  ) {
    return this.service.addControl(id, controlId);
  }

  @Delete(':id/controls/:controlId')
  @ApiOperation({ summary: 'Remove a control mapping from this risk' })
  async removeControl(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('controlId', ParseUUIDPipe) controlId: string,
  ) {
    return this.service.removeControl(id, controlId);
  }
}
