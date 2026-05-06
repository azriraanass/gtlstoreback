import { Logger, Injectable } from '@nestjs/common';
import { Cron, CronExpression} from '@nestjs/schedule';
import { SyncService } from 'src/sync/sync.service';

@Injectable()
export class SchedulerService {

    private readonly logger: Logger;

    constructor(
        private readonly syncService: SyncService,
    ) {
        this.logger = new Logger(SchedulerService.name);
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {

        this.logger.debug(`${this.handleCron.name}: Running scheduled task...`);
        await this.syncService.syncDataBaseWithWoocommerce();
        this.logger.debug(`${this.handleCron.name}: Finished scheduled task...`);
    }
}
