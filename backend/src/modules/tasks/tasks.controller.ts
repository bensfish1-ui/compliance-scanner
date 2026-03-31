import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, BulkStatusUpdateDto, ReorderTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Audit({ entityType: 'Task', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with pagination and filters' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details with subtasks' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @Audit({ entityType: 'Task', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @Audit({ entityType: 'Task', action: 'DELETE' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.delete(id, user);
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Get subtasks for a parent task' })
  async getSubtasks(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.getSubtasks(id);
  }

  @Post('bulk-status')
  @Audit({ entityType: 'Task', action: 'BULK_UPDATE' })
  @ApiOperation({ summary: 'Bulk update task statuses' })
  async bulkStatusUpdate(@Body() dto: BulkStatusUpdateDto, @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.bulkStatusUpdate(dto, user);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder tasks (Kanban drag & drop)' })
  async reorderTasks(@Body() reorders: ReorderTaskDto[], @CurrentUser() user: AuthenticatedUser) {
    return this.tasksService.reorderTasks(reorders, user);
  }

  @Post(':id/log-time')
  @Audit({ entityType: 'Task', action: 'LOG_TIME' })
  @ApiOperation({ summary: 'Log time against a task' })
  async logTime(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('hours') hours: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.tasksService.logTime(id, hours, user);
  }

  @Post(':id/generate-recurring')
  @ApiOperation({ summary: 'Generate next occurrence of a recurring task' })
  async generateRecurring(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.generateRecurringTask(id);
  }
}
