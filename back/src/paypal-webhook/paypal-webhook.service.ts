import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalService {
  private environment: any;
  private client: any;

  constructor(private readonly configService: ConfigService) {
    this.environment = new (require('@paypal/checkout-server-sdk').core.SandboxEnvironment)(
      this.configService.get<string>('PAYPAL_CLIENT_ID'),
      this.configService.get<string>('PAYPAL_CLIENT_SECRET'),
    );
    this.client = new (require('@paypal/checkout-server-sdk').core.PayPalHttpClient)(this.environment);
  }

  // Get access token
  async getAccessToken(): Promise<string> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET')
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios({
      method: 'post',
      url: `https://api.sandbox.paypal.com/v1/oauth2/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      data: 'grant_type=client_credentials',
    });
    // console.log("token: ",response.data.access_token)
    return response.data.access_token;
  }

  // Verify webhook signature
  async verifyWebhookSignature(body: any, headers: any): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    const verificationData = {
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: this.configService.get<string>('PAYPAL_WEBHOOK_ID'),
      webhook_event: body,
    };
    // console.log(verificationData)
    try {
      const response = await axios.post(
        'https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
        verificationData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("verification", response.data)
      return response.data.verification_status /*=== 'SUCCESS'*/;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}
