// payments/payments.controller.ts
import { Controller, Post, Body, Query, Get } from '@nestjs/common';
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
    console.log("capture payment",result)
    return result;
  }

  @Get('get-merchant-id')
  getMerchantId(@Query('counselorId') counselorId: string) {
    const counselor = this.paymentsService.getCounselorById(counselorId);
    console.log(counselor);
    return counselor ? { merchantId: counselor.paypalMerchantId } : { error: 'Counselor not found' };
  }

  
}
