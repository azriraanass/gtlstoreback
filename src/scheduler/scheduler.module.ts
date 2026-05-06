import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SyncModule } from 'src/sync/sync.module';

@Module({
  imports: [SyncModule],
  providers: [SchedulerService]
})
export class SchedulerModule {}
