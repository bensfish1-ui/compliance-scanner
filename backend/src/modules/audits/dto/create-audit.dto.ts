import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString,
  IsNumber, Min, Max, MaxLength, IsArray,
} from 'class-validator';

export enum AuditStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  FIELDWORK = 'FIELDWORK',
  REPORTING = 'REPORTING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AuditType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  REGULATORY = 'REGULATORY',
  CERTIFICATION = 'CERTIFICATION',
}

export enum FindingSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FindingStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  REMEDIATED = 'REMEDIATED',
  CLOSED = 'CLOSED',
  ACCEPTED = 'ACCEPTED',
}

export enum CAPAStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IMPLEMENTED = 'IMPLEMENTED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
}

export class CreateAuditDto {
  @ApiProperty({ description: 'Audit title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Audit description / scope' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: AuditType })
  @IsEnum(AuditType)
  type: AuditType;

  @ApiProperty({ enum: AuditStatus, default: AuditStatus.PLANNED })
  @IsEnum(AuditStatus)
  status: AuditStatus = AuditStatus.PLANNED;

  @ApiPropertyOptional({ description: 'Related regulation IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  regulationIds?: string[];

  @ApiPropertyOptional({ description: 'Lead auditor user ID' })
  @IsOptional()
  @IsUUID()
  leadAuditorId?: string;

  @ApiPropertyOptional({ description: 'Auditor team member IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  auditorIds?: string[];

  @ApiPropertyOptional({ description: 'Planned start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Planned end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Readiness score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readinessScore?: number;

  @ApiPropertyOptional({ description: 'Recurrence rule for scheduling (RRULE format)' })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}

export class CreateFindingDto {
  @ApiProperty({ description: 'Finding title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Finding description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: FindingSeverity })
  @IsEnum(FindingSeverity)
  severity: FindingSeverity;

  @ApiProperty({ enum: FindingStatus, default: FindingStatus.OPEN })
  @IsEnum(FindingStatus)
  status: FindingStatus = FindingStatus.OPEN;

  @ApiPropertyOptional({ description: 'Recommendation' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  recommendation?: string;

  @ApiPropertyOptional({ description: 'Due date for remediation' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Assigned owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}

export class CreateCAPADto {
  @ApiProperty({ description: 'CAPA title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'CAPA description / action plan' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: CAPAStatus, default: CAPAStatus.OPEN })
  @IsEnum(CAPAStatus)
  status: CAPAStatus = CAPAStatus.OPEN;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Assigned owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Whether this is corrective (true) or preventive (false)' })
  @IsOptional()
  isCorrective?: boolean;
}
