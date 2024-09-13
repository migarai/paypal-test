import { Module } from '@nestjs/common';
import { PayPalWebhookController, } from './paypal-webhook.controller';
import { PayPalService,} from './paypal-webhook.service';

@Module({
  controllers: [PayPalWebhookController],
  providers: [PayPalService]
})
export class PaypalWebhookModule {}
