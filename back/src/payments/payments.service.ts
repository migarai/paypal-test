// payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';

export enum OrderStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELED_BY_CUSTOMER = 'CANCELED_BY_CUSTOMER',
  CANCELED_DUE_TO_ERROR = 'CANCELED_DUE_TO_ERROR',
}

export interface Order {
  id: string;
  counselorId: string;
  price: number;
  status: OrderStatus;
  error?: string; // In case of cancellation due to errors
}

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

  private orders: Order[] = []; // Our temporary in-memory "database"

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

  // Retrieve an order by ID
  getOrderById(orderId: string) {
    return this.orders.find(order => order.id === orderId);
  }

  // Create a new order and track its status
  async createPayment(counselorId: string, price: number) {
    const counselor = this.counselors.find((c) => c.id === counselorId);
    if (!counselor) {
      throw new Error('Counselor not found');
    }

    const merchantId = counselor.paypalMerchantId.toString();
    
    // Create a new order in our "database"
    const orderId = Date.now().toString(); // Simple unique ID based on timestamp
    const newOrder: Order = {
      id: orderId,
      counselorId,
      price,
      status: OrderStatus.CREATED,
    };
    this.orders.push(newOrder);

    try {
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
              merchant_id: merchantId,
            },
          },
        ],
      });

      const response = await this.client.execute(request);
      console.log(orderId)
      return { response: response.result, orderId };
    } catch (error) {
      // Mark order as canceled due to error
      newOrder.status = OrderStatus.CANCELED_DUE_TO_ERROR;
      newOrder.error = error.message;
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }

  // Capture a payment and update the order status
  async capturePayment(orderId: string) {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      const response = await this.client.execute(request);

      // Update order status to completed
      order.status = OrderStatus.COMPLETED;
      return response.result;
    } catch (error) {
      // Mark order as canceled due to error
      order.status = OrderStatus.CANCELED_DUE_TO_ERROR;
      order.error = error.message;
      throw new Error(`Payment capture failed: ${error.message}`);
    }
  }

  // Cancel an order by customer
  cancelOrder(orderId: string) {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to canceled by the customer
    order.status = OrderStatus.CANCELED_BY_CUSTOMER;
    return { message: `Order ${orderId} canceled by customer` };
  }

  getCounselorById(counselorId: string) {
    const counselor = this.counselors.find(counselor => counselor.id === counselorId);
    if (!counselor) {
      throw new Error('Counselor not found');
    }
    return counselor;
  }

  
}
