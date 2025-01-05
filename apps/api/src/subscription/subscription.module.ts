import { Module } from '@nestjs/common';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { SubscriptionService } from './subscription.service';
import { SyncTokenUsageProcessor, SyncStorageUsageProcessor } from './subscription.processor';
import { SubscriptionController } from './subscription.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule, StripeModule.externallyConfigured(StripeModule, 0)],
  providers: [SubscriptionService, SyncTokenUsageProcessor, SyncStorageUsageProcessor],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
