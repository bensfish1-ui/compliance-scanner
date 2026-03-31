import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString, IsNumber, Min, MaxLength,
} from 'class-validator';

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

export class CreatePolicyDto {
  @ApiProperty({ description: 'Policy title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Full policy content (rich text / markdown)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ enum: PolicyStatus, default: PolicyStatus.DRAFT })
  @IsEnum(PolicyStatus)
  status: PolicyStatus = PolicyStatus.DRAFT;

  @ApiPropertyOptional({ description: 'Version number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({ description: 'Category / type' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  category?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Approver user ID' })
  @IsOptional()
  @IsUUID()
  approverId?: string;

  @ApiPropertyOptional({ description: 'Effective date' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Expiry / review date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Next review date' })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @ApiPropertyOptional({ description: 'Related regulation ID' })
  @IsOptional()
  @IsUUID()
  regulationId?: string;
}
