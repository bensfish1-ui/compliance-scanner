import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString,
  IsNumber, Min, Max, MaxLength, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum IAStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ScoringFactorDto {
  @ApiProperty({ description: 'Factor name (e.g., "Operational Impact")' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Score (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ description: 'Weight (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @ApiPropertyOptional({ description: 'Justification for the score' })
  @IsOptional()
  @IsString()
  justification?: string;
}

export class CreateImpactAssessmentDto {
  @ApiProperty({ description: 'Impact assessment title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Related regulation ID' })
  @IsUUID()
  regulationId: string;

  @ApiProperty({ enum: IAStatus, default: IAStatus.DRAFT })
  @IsEnum(IAStatus)
  status: IAStatus = IAStatus.DRAFT;

  @ApiPropertyOptional({ description: 'Multi-factor scoring', type: [ScoringFactorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScoringFactorDto)
  scoringFactors?: ScoringFactorDto[];

  @ApiPropertyOptional({ description: 'Overall impact score (auto-calculated from factors)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore?: number;

  @ApiPropertyOptional({ description: 'Gap analysis notes' })
  @IsOptional()
  @IsString()
  gapAnalysis?: string;

  @ApiPropertyOptional({ description: 'Assigned assessor user ID' })
  @IsOptional()
  @IsUUID()
  assessorId?: string;

  @ApiPropertyOptional({ description: 'Approver user ID' })
  @IsOptional()
  @IsUUID()
  approverId?: string;

  @ApiPropertyOptional({ description: 'Due date for completion' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Business area IDs affected', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  businessAreaIds?: string[];
}
