import { Module } from '@nestjs/common';
import { HorizonScanningController } from './horizon-scanning.controller';
import { HorizonScanningService } from './horizon-scanning.service';
import { RegulatorySourcesService } from './regulatory-sources.service';

@Module({
  controllers: [HorizonScanningController],
  providers: [HorizonScanningService, RegulatorySourcesService],
  exports: [HorizonScanningService, RegulatorySourcesService],
})
export class HorizonScanningModule {}
