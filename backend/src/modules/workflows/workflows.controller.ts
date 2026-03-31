import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Workflows')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Post()
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Create a new workflow' })
  async create(@Body() dto: CreateWorkflowDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow details with execution history' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Update a workflow' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateWorkflowDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a workflow' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Manually trigger a workflow' })
  async manualTrigger(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() context: Record<string, any>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.manualTrigger(id, context, user);
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get workflow execution history' })
  async getExecutions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.getExecutionHistory(id, query);
  }
}
