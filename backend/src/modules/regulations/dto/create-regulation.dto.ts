import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  IsUrl,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum RegulationStatus {
  DRAFT = 'DRAFT',
  PROPOSED = 'PROPOSED',
  CONSULTATION = 'CONSULTATION',
  ENACTED = 'ENACTED',
  IN_FORCE = 'IN_FORCE',
  AMENDED = 'AMENDED',
  REPEALED = 'REPEALED',
}

export enum ImpactLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum LifecycleStage {
  MONITORING = 'MONITORING',
  ASSESSMENT = 'ASSESSMENT',
  IMPLEMENTATION = 'IMPLEMENTATION',
  COMPLIANCE = 'COMPLIANCE',
  REVIEW = 'REVIEW',
}

export class CreateRegulationDto {
  @ApiProperty({ description: 'Regulation title', example: 'General Data Protection Regulation' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @ApiProperty({ description: 'Short reference code', example: 'GDPR-2016/679' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  referenceCode: string;

  @ApiPropertyOptional({ description: 'Full regulation description / summary' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ description: 'Full text body of the regulation' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ description: 'Country ID', example: 'uuid' })
  @IsUUID()
  countryId: string;

  @ApiPropertyOptional({ description: 'Regulator / issuing body ID' })
  @IsOptional()
  @IsUUID()
  regulatorId?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ enum: RegulationStatus, description: 'Current status', default: RegulationStatus.DRAFT })
  @IsEnum(RegulationStatus)
  status: RegulationStatus = RegulationStatus.DRAFT;

  @ApiProperty({ enum: ImpactLevel, description: 'Assessed impact level', default: ImpactLevel.MEDIUM })
  @IsEnum(ImpactLevel)
  impactLevel: ImpactLevel = ImpactLevel.MEDIUM;

  @ApiProperty({ enum: LifecycleStage, description: 'Current lifecycle stage', default: LifecycleStage.MONITORING })
  @IsEnum(LifecycleStage)
  lifecycleStage: LifecycleStage = LifecycleStage.MONITORING;

  @ApiPropertyOptional({ description: 'Date the regulation was published / enacted' })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @ApiPropertyOptional({ description: 'Date the regulation comes into force' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Compliance deadline' })
  @IsOptional()
  @IsDateString()
  complianceDeadline?: string;

  @ApiPropertyOptional({ description: 'Official source URL' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Business area IDs this regulation applies to', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  businessAreaIds?: string[];

  @ApiPropertyOptional({ description: 'Priority score (1-10)', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priorityScore?: number;

  @ApiPropertyOptional({ description: 'Notes or comments' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Assigned owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
