import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { CreateAuditDto, CreateFindingDto, CreateCAPADto } from './dto/create-audit.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Audits')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
  @Audit({ entityType: 'Audit', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new audit' })
  @ApiResponse({ status: 201, description: 'Audit created' })
  async create(@Body() dto: CreateAuditDto, @CurrentUser() user: AuthenticatedUser) {
    return this.auditsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List audits with pagination' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.auditsService.findAll(query);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get audit calendar data for a date range' })
  @ApiQuery({ name: 'startDate', type: String })
  @ApiQuery({ name: 'endDate', type: String })
  async getCalendar(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.auditsService.getCalendarData(startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit details with findings and CAPAs' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
  @Audit({ entityType: 'Audit', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update an audit' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAuditDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Audit', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an audit' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.auditsService.delete(id, user);
  }

  @Get(':id/readiness-score')
  @ApiOperation({ summary: 'Calculate audit readiness score' })
  async calculateReadinessScore(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditsService.calculateReadinessScore(id);
  }

  @Post(':id/ai-questions')
  @ApiOperation({ summary: 'Trigger AI generation of audit questions' })
  async triggerAIQuestions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.triggerAIQuestionGeneration(id, user);
  }

  // ── Findings endpoints ──

  @Post(':auditId/findings')
  @Audit({ entityType: 'Finding', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a finding for an audit' })
  async createFinding(
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: CreateFindingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.createFinding(auditId, dto, user);
  }

  @Put('findings/:findingId')
  @Audit({ entityType: 'Finding', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a finding' })
  async updateFinding(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: Partial<CreateFindingDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.updateFinding(findingId, dto, user);
  }

  @Delete('findings/:findingId')
  @Audit({ entityType: 'Finding', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a finding' })
  async deleteFinding(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.deleteFinding(findingId, user);
  }

  // ── CAPA endpoints ──

  @Post('findings/:findingId/capas')
  @Audit({ entityType: 'CAPA', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a CAPA for a finding' })
  async createCAPA(
    @Param('findingId', ParseUUIDPipe) findingId: string,
    @Body() dto: CreateCAPADto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.createCAPA(findingId, dto, user);
  }

  @Put('capas/:capaId')
  @Audit({ entityType: 'CAPA', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a CAPA' })
  async updateCAPA(
    @Param('capaId', ParseUUIDPipe) capaId: string,
    @Body() dto: Partial<CreateCAPADto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.updateCAPA(capaId, dto, user);
  }

  @Delete('capas/:capaId')
  @Audit({ entityType: 'CAPA', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a CAPA' })
  async deleteCAPA(
    @Param('capaId', ParseUUIDPipe) capaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.auditsService.deleteCAPA(capaId, user);
  }
}
