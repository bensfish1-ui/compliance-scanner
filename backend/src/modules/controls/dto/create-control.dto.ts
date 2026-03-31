import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString,
  MaxLength, IsArray,
} from 'class-validator';

export enum ControlType {
  PREVENTIVE = 'PREVENTIVE',
  DETECTIVE = 'DETECTIVE',
  CORRECTIVE = 'CORRECTIVE',
  DIRECTIVE = 'DIRECTIVE',
}

export enum ControlEffectiveness {
  EFFECTIVE = 'EFFECTIVE',
  PARTIALLY_EFFECTIVE = 'PARTIALLY_EFFECTIVE',
  INEFFECTIVE = 'INEFFECTIVE',
  NOT_TESTED = 'NOT_TESTED',
}

export class CreateControlDto {
  @ApiProperty({ description: 'Control title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ description: 'Control description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Control reference code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceCode?: string;

  @ApiProperty({ enum: ControlType })
  @IsEnum(ControlType)
  type!: ControlType;

  @ApiProperty({ enum: ControlEffectiveness, default: ControlEffectiveness.NOT_TESTED })
  @IsEnum(ControlEffectiveness)
  effectiveness: ControlEffectiveness = ControlEffectiveness.NOT_TESTED;

  @ApiPropertyOptional({ description: 'Control owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Frequency of control execution' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Last tested date' })
  @IsOptional()
  @IsDateString()
  lastTestedDate?: string;

  @ApiPropertyOptional({ description: 'Next test date' })
  @IsOptional()
  @IsDateString()
  nextTestDate?: string;

  @ApiPropertyOptional({ description: 'Obligation IDs this control satisfies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  obligationIds?: string[];
}
