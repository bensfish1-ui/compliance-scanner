import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsNumber,
  Min, Max, MaxLength, IsArray,
} from 'class-validator';

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ASSESSED = 'ASSESSED',
  MITIGATED = 'MITIGATED',
  ACCEPTED = 'ACCEPTED',
  CLOSED = 'CLOSED',
}

export enum RiskCategory {
  REGULATORY = 'REGULATORY',
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  REPUTATIONAL = 'REPUTATIONAL',
  STRATEGIC = 'STRATEGIC',
  TECHNOLOGY = 'TECHNOLOGY',
  LEGAL = 'LEGAL',
}

export class CreateRiskDto {
  @ApiProperty({ description: 'Risk title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Risk description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: RiskCategory })
  @IsEnum(RiskCategory)
  category: RiskCategory;

  @ApiProperty({ enum: RiskStatus, default: RiskStatus.IDENTIFIED })
  @IsEnum(RiskStatus)
  status: RiskStatus = RiskStatus.IDENTIFIED;

  @ApiProperty({ description: 'Likelihood score (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  likelihood: number;

  @ApiProperty({ description: 'Consequence/impact score (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  consequence: number;

  @ApiPropertyOptional({ description: 'Residual likelihood after controls (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  residualLikelihood?: number;

  @ApiPropertyOptional({ description: 'Residual consequence after controls (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  residualConsequence?: number;

  @ApiPropertyOptional({ description: 'Risk owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Related regulation ID' })
  @IsOptional()
  @IsUUID()
  regulationId?: string;

  @ApiPropertyOptional({ description: 'Business area ID' })
  @IsOptional()
  @IsUUID()
  businessAreaId?: string;

  @ApiPropertyOptional({ description: 'Mitigation plan' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  mitigationPlan?: string;

  @ApiPropertyOptional({ description: 'Control IDs mapped to this risk', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  controlIds?: string[];
}
