import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength, IsArray } from 'class-validator';

export class CreateEvidenceDto {
  @ApiProperty({ description: 'Evidence title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

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

  @ApiPropertyOptional({ description: 'Related control ID' })
  @IsOptional()
  @IsUUID()
  controlId?: string;

  @ApiPropertyOptional({ description: 'Related obligation ID' })
  @IsOptional()
  @IsUUID()
  obligationId?: string;

  @ApiPropertyOptional({ description: 'Related audit ID' })
  @IsOptional()
  @IsUUID()
  auditId?: string;

  @ApiPropertyOptional({ description: 'Related finding ID' })
  @IsOptional()
  @IsUUID()
  findingId?: string;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
