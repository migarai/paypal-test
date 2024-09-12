// payments/payments.controller.ts
import { Controller, Post, Body, Query, Get, Patch } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Endpoint to create a payment for a counselor's service
  @Post('create-payment')
  async createPayment(@Body() body) {
    const { counselorId, serviceId, price } = body;
    try {
      const payment = await this.paymentsService.createPayment(counselorId, price);
      return {
        success: true,
        message: 'Payment created successfully',
        payment,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Endpoint to capture payment for a given order
  @Post('capture-payment')
  async capturePayment(@Query('orderId') orderId: string) {
    try {
      const result = await this.paymentsService.capturePayment(orderId);
      return {
        success: true,
        message: 'Payment captured successfully',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Endpoint to cancel an order by customer
  @Patch('cancel-payment')
  cancelOrder(@Query('orderId') orderId: string) {
    try {
      const result = this.paymentsService.cancelOrder(orderId);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get PayPal Merchant ID for a specific counselor
  @Get('get-merchant-id')
  getMerchantId(@Query('counselorId') counselorId: string) {
    const counselor = this.paymentsService.getCounselorById(counselorId);
    if (counselor) {
      return {
        success: true,
        merchantId: counselor.paypalMerchantId,
      };
    }
    return {
      success: false,
      message: 'Counselor not found',
    };
  }

  // Get order details by ID
  @Get('get-order')
  getOrderById(@Query('orderId') orderId: string) {
    const order = this.paymentsService.getOrderById(orderId);
    if (order) {
      return {
        success: true,
        order,
      };
    }
    return {
      success: false,
      message: 'Order not found',
    };
  }
}
