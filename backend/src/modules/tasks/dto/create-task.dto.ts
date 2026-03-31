import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString,
  IsNumber, Min, Max, MaxLength, IsArray, IsBoolean,
} from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Project ID' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ description: 'Parent task ID (for subtasks)' })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  status: TaskStatus = TaskStatus.TODO;

  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority = TaskPriority.MEDIUM;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Estimated hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Actual hours logged' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Dependency task IDs (tasks that must complete first)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dependencyIds?: string[];

  @ApiPropertyOptional({ description: 'Order index for Kanban / list sorting' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Whether this is a milestone' })
  @IsOptional()
  @IsBoolean()
  isMilestone?: boolean;

  @ApiPropertyOptional({ description: 'Recurrence rule (RRULE format for recurring tasks)' })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class BulkStatusUpdateDto {
  @ApiProperty({ description: 'Task IDs to update', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  taskIds: string[];

  @ApiProperty({ enum: TaskStatus, description: 'New status' })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class ReorderTaskDto {
  @ApiProperty({ description: 'Task ID' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ description: 'New order index' })
  @IsNumber()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'New status column (for Kanban drag)' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
