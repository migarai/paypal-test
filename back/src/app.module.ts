// app.module.ts
import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { PaypalWebhookModule } from './paypal-webhook/paypal-webhook.module';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), PaymentsModule, PaypalWebhookModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
