import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Projects')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'PROJECT_MANAGER')
  @Audit({ entityType: 'Project', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new compliance project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List projects with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of projects' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'PROJECT_MANAGER')
  @Audit({ entityType: 'Project', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a project' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @Audit({ entityType: 'Project', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (soft) a project' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.projectsService.delete(id, user);
  }

  @Get(':id/gantt')
  @ApiOperation({ summary: 'Get Gantt chart data for a project' })
  async getGanttData(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getGanttData(id);
  }

  @Get(':id/kanban')
  @ApiOperation({ summary: 'Get Kanban board data for a project' })
  async getKanbanData(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getKanbanData(id);
  }

  @Get(':id/budget')
  @ApiOperation({ summary: 'Get budget tracking data' })
  async getBudgetTracking(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getBudgetTracking(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Calculate and return project progress' })
  async calculateProgress(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.calculateProgress(id);
  }

  @Get(':id/slippage')
  @ApiOperation({ summary: 'Detect overdue tasks (timeline slippage)' })
  async detectSlippage(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.detectSlippage(id);
  }
}
