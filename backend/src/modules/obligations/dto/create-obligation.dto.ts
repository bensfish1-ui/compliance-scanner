import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString, MaxLength,
} from 'class-validator';

export enum ObligationStatus {
  IDENTIFIED = 'IDENTIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export class CreateObligationDto {
  @ApiProperty({ description: 'Obligation title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({ description: 'Obligation description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Source regulation ID' })
  @IsUUID()
  regulationId: string;

  @ApiPropertyOptional({ description: 'Section reference within the regulation' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sectionReference?: string;

  @ApiProperty({ enum: ObligationStatus, default: ObligationStatus.IDENTIFIED })
  @IsEnum(ObligationStatus)
  status: ObligationStatus = ObligationStatus.IDENTIFIED;

  @ApiPropertyOptional({ description: 'Compliance deadline' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Priority (1-10)' })
  @IsOptional()
  priority?: number;
}
