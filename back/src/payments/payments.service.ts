// payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentsService {
  private counselors = [
    {
      id: '1',
      name: 'John Doe',
      paypalMerchantId: 'MERCHANT_ID_1',
      paypalMerchantemail: 'sb-vzwur32540594@business.example.com',
      services: [{ id: '1', name: 'Consultation', price: 50 }],
    },
    {
      id: '2',
      name: 'Jane Smith',
      paypalMerchantId: 'MERCHANT_ID_2',
      services: [{ id: '2', name: 'Therapy', price: 80 }],
    },
  ];

  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    this.environment = new paypal.core.SandboxEnvironment(
      'ASr2HRNIbdOHLQE9KtxVeZIISi3df3IG7RgIXfbG9WBrM7F6fUVIGZoXdblGHe7Z07jwGRL6pc-1ZKef',
      'EHZC-hMHsr4HSv356U-hQPE_3HKRvr4Im_Jujsj2QY317br0_ztsEBsq-iZRTPH9fS8thnIGEiKlf8mm',
    );
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  // Return the list of counselors
  getCounselors() {
    return this.counselors;
  }

  async createPayment(counselorId: string, price: number) {
    const counselor = this.counselors.find((c) => c.id === counselorId);
    // Ensure merchant_id is a string
    const merchantId = counselor.paypalMerchantId.toString();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            value: price.toString(),
            currency_code: 'USD',
          },
          payee: {
            email: counselor.paypalMerchantemail,
          },
        },
      ],
    });

    const response = await this.client.execute(request);
    return response.result;
  }

  async capturePayment(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }
}
