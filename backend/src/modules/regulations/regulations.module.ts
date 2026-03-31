import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RegulationsController } from './regulations.controller';
import { RegulationsService } from './regulations.service';

@Module({
  imports: [ConfigModule],
  controllers: [RegulationsController],
  providers: [RegulationsService],
  exports: [RegulationsService],
})
export class RegulationsModule {}
