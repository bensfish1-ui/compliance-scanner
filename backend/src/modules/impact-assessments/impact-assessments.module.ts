import { Module } from '@nestjs/common';
import { ImpactAssessmentsController } from './impact-assessments.controller';
import { ImpactAssessmentsService } from './impact-assessments.service';

@Module({
  controllers: [ImpactAssessmentsController],
  providers: [ImpactAssessmentsService],
  exports: [ImpactAssessmentsService],
})
export class ImpactAssessmentsModule {}
