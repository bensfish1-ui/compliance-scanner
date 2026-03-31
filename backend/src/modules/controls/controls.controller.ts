import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ControlsService } from './controls.service';
import { CreateControlDto } from './dto/create-control.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Controls')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('controls')
export class ControlsController {
  constructor(private readonly service: ControlsService) {}

  @Post()
  @Audit({ entityType: 'Control', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new control' })
  async create(@Body() dto: CreateControlDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List controls' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('effectiveness')
  @ApiOperation({ summary: 'Get control effectiveness statistics' })
  async getEffectivenessStats() {
    return this.service.getEffectivenessStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get control details with obligations and risks' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'Control', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a control' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateControlDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'Control', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a control' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }

  @Post(':id/obligations/:obligationId')
  @ApiOperation({ summary: 'Map a control to an obligation' })
  async addObligation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('obligationId', ParseUUIDPipe) obligationId: string,
  ) {
    return this.service.addObligation(id, obligationId);
  }

  @Delete(':id/obligations/:obligationId')
  @ApiOperation({ summary: 'Remove obligation mapping from control' })
  async removeObligation(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('obligationId', ParseUUIDPipe) obligationId: string,
  ) {
    return this.service.removeObligation(id, obligationId);
  }
}
