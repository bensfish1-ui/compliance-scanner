import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScanRequestDto {
  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha-2 country codes to scan. Omit or pass empty array to scan all countries in the database.',
    example: ['GB', 'US', 'DE'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({
    description: 'Sectors/categories to focus on.',
    example: ['Data Protection', 'Financial Services'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectors?: string[];

  @ApiPropertyOptional({
    description: 'Whether to include proposed/consultation-stage regulations.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeProposed?: boolean = true;
}

export class ScanResultItemDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsString()
  regulator: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({ enum: ['PROPOSED', 'CONSULTATION', 'APPROVED', 'ENACTED', 'EFFECTIVE'] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveDate?: string | null;

  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] })
  @IsString()
  impactLevel: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceUrl?: string | null;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  keyObligations: string[];

  @ApiProperty()
  @IsBoolean()
  isAmendment: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amendedLegislation?: string | null;
}

export class ImportScanResultDto {
  @ApiProperty({ type: [ScanResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScanResultItemDto)
  regulations: ScanResultItemDto[];
}
