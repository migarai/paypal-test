import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PayPalService } from './paypal-webhook.service';


@Controller('paypal')
export class PayPalWebhookController {
  constructor(
    private readonly payPalService: PayPalService,
    
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const body = req.body;
    const headers = req.headers;
    // console.log(headers)
    // Optional: Verify webhook signature for security
    const isValid = await this.payPalService.verifyWebhookSignature(body, headers);
    if (!isValid) {
      return res.status(400).send('Invalid webhook signature');
    }

    // Process PayPal event based on event type
    switch (body.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        console.log('Payment Capture Completed:', body);
        break;

      case 'CHECKOUT.ORDER.APPROVED':
        // Handle order approval
        console.log('Order Approved:', body);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        // Handle payment failure/denial
        console.log('Payment Capture Denied:', body);
        break;

      default:
        console.log('Unhandled PayPal Event:', body.event_type);
        
    }
    // console.log("body", body)
    res.status(200).send('Webhook processed');
  }
}
