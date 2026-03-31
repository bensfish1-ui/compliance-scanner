import { Module } from '@nestjs/common';
import { RegulationEventsService } from './regulation-events.service';

@Module({
  providers: [RegulationEventsService],
  exports: [RegulationEventsService],
})
export class EventsModule {}
