import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, MaxLength, IsEnum,
} from 'class-validator';

export enum DocumentType {
  REGULATION_TEXT = 'REGULATION_TEXT',
  POLICY = 'POLICY',
  EVIDENCE = 'EVIDENCE',
  REPORT = 'REPORT',
  CORRESPONDENCE = 'CORRESPONDENCE',
  TEMPLATE = 'TEMPLATE',
  OTHER = 'OTHER',
}

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: DocumentType, default: DocumentType.OTHER })
  @IsEnum(DocumentType)
  type: DocumentType = DocumentType.OTHER;

  @ApiProperty({ description: 'S3 key / file path' })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiPropertyOptional({ description: 'Related regulation ID' })
  @IsOptional()
  @IsUUID()
  regulationId?: string;

  @ApiPropertyOptional({ description: 'Related policy ID' })
  @IsOptional()
  @IsUUID()
  policyId?: string;

  @ApiPropertyOptional({ description: 'Related audit ID' })
  @IsOptional()
  @IsUUID()
  auditId?: string;

  @ApiPropertyOptional({ description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization' })
  @IsOptional()
  tags?: string[];
}
