import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MaxLength,
  ValidateNested, IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkflowTriggerType {
  REGULATION_CREATED = 'REGULATION_CREATED',
  REGULATION_UPDATED = 'REGULATION_UPDATED',
  REGULATION_STATUS_CHANGED = 'REGULATION_STATUS_CHANGED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_COMPLETED = 'TASK_COMPLETED',
  AUDIT_CREATED = 'AUDIT_CREATED',
  POLICY_EXPIRING = 'POLICY_EXPIRING',
  RISK_SCORE_CHANGED = 'RISK_SCORE_CHANGED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
}

export enum WorkflowActionType {
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_STATUS = 'UPDATE_STATUS',
  ASSIGN_USER = 'ASSIGN_USER',
  CREATE_IMPACT_ASSESSMENT = 'CREATE_IMPACT_ASSESSMENT',
  TRIGGER_AI_ANALYSIS = 'TRIGGER_AI_ANALYSIS',
  WEBHOOK = 'WEBHOOK',
}

export class WorkflowConditionDto {
  @ApiProperty({ description: 'Field to evaluate' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Operator (equals, contains, gt, lt, in)' })
  @IsString()
  operator: string;

  @ApiProperty({ description: 'Value to compare against' })
  value: any;
}

export class WorkflowActionDto {
  @ApiProperty({ enum: WorkflowActionType })
  @IsEnum(WorkflowActionType)
  type: WorkflowActionType;

  @ApiProperty({ description: 'Action configuration (JSON)' })
  config: Record<string, any>;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: WorkflowTriggerType })
  @IsEnum(WorkflowTriggerType)
  triggerType: WorkflowTriggerType;

  @ApiPropertyOptional({ description: 'Conditions that must be met for the workflow to execute', type: [WorkflowConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @ApiProperty({ description: 'Actions to execute when triggered', type: [WorkflowActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];

  @ApiPropertyOptional({ description: 'Whether the workflow is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cron expression for scheduled workflows' })
  @IsOptional()
  @IsString()
  cronExpression?: string;
}
