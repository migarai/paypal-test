// payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentsService {
  private counselors = [
    {
      id: '1',
      name: 'John Doe',
      paypalMerchantId: '339PVSEB53AFL',
      paypalMerchantemail: 'sb-vzwur32540594@business.example.com',
      services: [{ id: '1', name: 'Consultation', price: 50 }],
    },
    {
      id: '2',
      name: 'Max Doe',
      paypalMerchantId: '6GKMS7S45GX4S',
      paypalMerchantemail: 'sb-tp2p232540888@business.example.com',
      services: [{ id: '2', name: 'Therapy', price: 80 }],
    },
  ];

  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    this.environment = new paypal.core.SandboxEnvironment(
      'AUqnmVYHz2F1H4qPlXunDvIPE7hOfQrObZGSsa2VfnYjNE85loUGA7DB1dqodsYhJTPWvkj85bxyIdn7',
      'EBF4t8EkOjYVBEezLF-bquw8Xu3iodMT9N6wz7EfMCcgha5ie863hGlKMc5xsVHMxLKk9XW_GC8lwrdz',
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
            // email_address: counselor.paypalMerchantemail,
            merchant_id: merchantId,
          },
        },
      ],
    });

    const response = await this.client.execute(request);
    console.log(response)
    return response.result;
  }

  async capturePayment(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await this.client.execute(request);
    return response.result;
  }

  getCounselorById(counselorId: string) {
    return this.counselors.find(counselor => counselor.id === counselorId);
  }
}
