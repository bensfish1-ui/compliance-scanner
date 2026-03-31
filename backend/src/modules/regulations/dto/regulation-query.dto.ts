import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { RegulationStatus, ImpactLevel, LifecycleStage } from './create-regulation.dto';

export class RegulationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by country ID' })
  @IsOptional()
  @IsUUID()
  countryId?: string;

  @ApiPropertyOptional({ description: 'Filter by regulator ID' })
  @IsOptional()
  @IsUUID()
  regulatorId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: RegulationStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RegulationStatus)
  status?: RegulationStatus;

  @ApiPropertyOptional({ enum: ImpactLevel, description: 'Filter by impact level' })
  @IsOptional()
  @IsEnum(ImpactLevel)
  impactLevel?: ImpactLevel;

  @ApiPropertyOptional({ enum: LifecycleStage, description: 'Filter by lifecycle stage' })
  @IsOptional()
  @IsEnum(LifecycleStage)
  lifecycleStage?: LifecycleStage;

  @ApiPropertyOptional({ description: 'Filter by effective date from' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by effective date to' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by business area ID' })
  @IsOptional()
  @IsUUID()
  businessAreaId?: string;

  @ApiPropertyOptional({ description: 'Filter by owner user ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
