import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/create-setting.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Settings')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Post()
  @Audit({ entityType: 'Setting', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new system setting' })
  async create(@Body() dto: CreateSettingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiQuery({ name: 'category', required: false })
  async findAll(@Query('category') category?: string) {
    return this.service.findAll(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a setting by key' })
  async findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @Put(':key')
  @Audit({ entityType: 'Setting', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a setting value' })
  async update(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(key, dto, user);
  }

  @Delete(':key')
  @Audit({ entityType: 'Setting', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a setting' })
  async delete(@Param('key') key: string) {
    return this.service.delete(key);
  }
}
