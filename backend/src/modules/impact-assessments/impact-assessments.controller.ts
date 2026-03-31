import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImpactAssessmentsService } from './impact-assessments.service';
import { CreateImpactAssessmentDto } from './dto/create-impact-assessment.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Impact Assessments')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('impact-assessments')
export class ImpactAssessmentsController {
  constructor(private readonly service: ImpactAssessmentsService) {}

  @Post()
  @Audit({ entityType: 'ImpactAssessment', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new impact assessment' })
  async create(@Body() dto: CreateImpactAssessmentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List impact assessments' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get impact assessment details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'ImpactAssessment', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update an impact assessment' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateImpactAssessmentDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'ImpactAssessment', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an impact assessment' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }

  @Get(':id/gap-analysis')
  @ApiOperation({ summary: 'Get gap analysis for this assessment' })
  async getGapAnalysis(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getGapAnalysis(id);
  }

  @Post(':id/submit-approval')
  @Audit({ entityType: 'ImpactAssessment', action: 'SUBMIT_APPROVAL' })
  @ApiOperation({ summary: 'Submit impact assessment for approval' })
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approverId') approverId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitForApproval(id, approverId, user);
  }

  @Post(':id/approve')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'ImpactAssessment', action: 'APPROVE' })
  @ApiOperation({ summary: 'Approve or reject an impact assessment' })
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approved') approved: boolean,
    @Body('comments') comments: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.processApproval(id, approved, comments, user);
  }

  @Post(':id/ai-scoring')
  @ApiOperation({ summary: 'Trigger AI-assisted impact scoring' })
  async triggerAIScoring(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.triggerAIScoring(id, user);
  }
}
