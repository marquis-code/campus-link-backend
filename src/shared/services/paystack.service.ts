import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    };
  }

  async createCustomer(email: string, firstName: string, lastName: string, phone: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customer`,
        { email, first_name: firstName, last_name: lastName, phone },
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create Paystack customer', error.response?.data || error.message);
      throw error;
    }
  }

  async createVirtualAccount(customerCode: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/dedicated_account`,
        { customer: customerCode, preferred_bank: 'wema-bank' }, // Example bank
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create Virtual Account', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyWebhook(signature: string, payload: any) {
    // Basic verification logic could go here
    return true; 
  }
}
