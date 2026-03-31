import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSettingDto {
  @ApiProperty({ description: 'Setting key', example: 'notifications.email.enabled' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  key: string;

  @ApiProperty({ description: 'Setting value (stored as JSON string)' })
  @IsNotEmpty()
  value: any;

  @ApiPropertyOptional({ description: 'Description of this setting' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Category / group' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

export class UpdateSettingDto {
  @ApiProperty({ description: 'New value' })
  @IsNotEmpty()
  value: any;
}
