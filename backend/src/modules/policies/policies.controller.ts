import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Policies')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Post()
  @Audit({ entityType: 'Policy', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new policy' })
  async create(@Body() dto: CreatePolicyDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List policies' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get policies expiring within N days' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getExpiring(@Query('days') days?: number) {
    return this.service.getExpiringPolicies(days || 30);
  }

  @Get('due-for-review')
  @ApiOperation({ summary: 'Get policies due for review' })
  async getDueForReview() {
    return this.service.getPoliciesDueForReview();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy details with version history' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'Policy', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a policy' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreatePolicyDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'Policy', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a policy' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.delete(id, user);
  }

  @Post(':id/new-version')
  @Audit({ entityType: 'Policy', action: 'NEW_VERSION' })
  @ApiOperation({ summary: 'Create a new version of a policy' })
  async createNewVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string,
    @Body('changelog') changelog: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.createNewVersion(id, content, changelog, user);
  }

  @Post(':id/submit-approval')
  @Audit({ entityType: 'Policy', action: 'SUBMIT_APPROVAL' })
  @ApiOperation({ summary: 'Submit policy for approval' })
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approverId') approverId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitForApproval(id, approverId, user);
  }

  @Post(':id/approve')
  @Audit({ entityType: 'Policy', action: 'APPROVE' })
  @ApiOperation({ summary: 'Approve or reject a policy' })
  async processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approved') approved: boolean,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.processApproval(id, approved, user);
  }

  @Get(':id/compare')
  @ApiOperation({ summary: 'Compare two versions of a policy' })
  @ApiQuery({ name: 'versionA', type: Number })
  @ApiQuery({ name: 'versionB', type: Number })
  async compareVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('versionA') versionA: number,
    @Query('versionB') versionB: number,
  ) {
    return this.service.compareVersions(id, versionA, versionB);
  }
}
