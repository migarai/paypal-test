// payments/payments.controller.ts
import { Controller, Post, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  async createPayment(@Body() body) {
    const { counselorId, serviceId, price } = body;
    const payment = await this.paymentsService.createPayment(
      counselorId,
      price,
    );
    return payment;
  }

  @Post('capture-payment')
  async capturePayment(@Query('orderId') orderId: string) {
    const result = await this.paymentsService.capturePayment(orderId);
    return result;
  }
}
