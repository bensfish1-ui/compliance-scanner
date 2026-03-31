import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RegulationsService } from './regulations.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';
import { RegulationQueryDto } from './dto/regulation-query.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Regulations')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('regulations')
export class RegulationsController {
  constructor(private readonly regulationsService: RegulationsService) {}

  @Post()
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'REGULATION_MANAGER')
  @Audit({ entityType: 'Regulation', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new regulation' })
  @ApiResponse({ status: 201, description: 'Regulation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() dto: CreateRegulationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List regulations with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of regulations' })
  async findAll(@Query() query: RegulationQueryDto) {
    return this.regulationsService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get regulation statistics (counts by status, impact, etc.)' })
  @ApiResponse({ status: 200, description: 'Regulation statistics' })
  async getStatistics() {
    return this.regulationsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single regulation by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Regulation details' })
  @ApiResponse({ status: 404, description: 'Regulation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.regulationsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'REGULATION_MANAGER')
  @Audit({ entityType: 'Regulation', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a regulation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Regulation updated successfully' })
  @ApiResponse({ status: 404, description: 'Regulation not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRegulationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Regulation', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive (soft-delete) a regulation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Regulation archived' })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.archive(id, user);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get regulation activity timeline' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Regulation timeline' })
  async getTimeline(@Param('id', ParseUUIDPipe) id: string) {
    return this.regulationsService.getTimeline(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related regulations (same country, category, or regulator)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Related regulations' })
  async getRelated(@Param('id', ParseUUIDPipe) id: string) {
    return this.regulationsService.getRelated(id);
  }

  @Get(':id/obligations')
  @ApiOperation({ summary: 'Get obligations derived from this regulation' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of obligations' })
  async getObligations(@Param('id', ParseUUIDPipe) id: string) {
    return this.regulationsService.getObligations(id);
  }

  @Post(':id/business-areas/:businessAreaId')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Regulation', action: 'UPDATE' })
  @ApiOperation({ summary: 'Add a business area to a regulation' })
  @ApiResponse({ status: 200, description: 'Business area added' })
  async addBusinessArea(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessAreaId', ParseUUIDPipe) businessAreaId: string,
  ) {
    return this.regulationsService.addBusinessArea(id, businessAreaId);
  }

  @Delete(':id/business-areas/:businessAreaId')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Regulation', action: 'UPDATE' })
  @ApiOperation({ summary: 'Remove a business area from a regulation' })
  @ApiResponse({ status: 200, description: 'Business area removed' })
  async removeBusinessArea(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessAreaId', ParseUUIDPipe) businessAreaId: string,
  ) {
    return this.regulationsService.removeBusinessArea(id, businessAreaId);
  }

  @Post(':id/ai-analysis')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'REGULATION_MANAGER')
  @Audit({ entityType: 'Regulation', action: 'AI_ANALYSIS' })
  @ApiOperation({ summary: 'Trigger AI analysis of the regulation text' })
  @ApiResponse({ status: 200, description: 'AI analysis queued' })
  async triggerAIAnalysis(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.triggerAIAnalysis(id, user);
  }

  @Post(':id/generate-audit')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Audit', action: 'CREATE' })
  @ApiOperation({ summary: 'Auto-generate a gap analysis audit from this regulation' })
  async generateAudit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.generateGapAnalysisAudit(id, user);
  }

  @Post(':id/generate-project')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Project', action: 'CREATE' })
  @ApiOperation({ summary: 'Auto-generate an implementation project plan from this regulation' })
  async generateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.regulationsService.generateImplementationProject(id, user);
  }
}
