import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ObligationsService } from './obligations.service';
import { CreateObligationDto } from './dto/create-obligation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Obligations')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('obligations')
export class ObligationsController {
  constructor(private readonly service: ObligationsService) {}

  @Post()
  @Audit({ entityType: 'Obligation', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new obligation' })
  async create(@Body() dto: CreateObligationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List obligations' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get obligation details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'Obligation', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update an obligation' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateObligationDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'Obligation', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an obligation' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }
}
