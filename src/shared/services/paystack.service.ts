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
        { customer: customerCode, preferred_bank: 'wema-bank' },
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create Virtual Account', error.response?.data || error.message);
      throw error;
    }
  }

  async initializeTransaction(email: string, amount: number, reference: string, callbackUrl?: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: Math.round(amount * 100),
          reference,
          callback_url: callbackUrl,
        },
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to initialize Paystack transaction', error.response?.data || error.message);
      throw error;
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to verify Paystack transaction', error.response?.data || error.message);
      throw error;
    }
  }

  async createTransferRecipient(name: string, accountNumber: string, bankCode: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create Transfer Recipient', error.response?.data || error.message);
      throw error;
    }
  }

  async initiateTransfer(amount: number, recipientCode: string, reference: string, reason?: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          amount: Math.round(amount * 100), // convert to kobo
          recipient: recipientCode,
          reference,
          reason: reason || 'CampusLink Payout',
        },
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to initiate transfer', error.response?.data || error.message);
      throw error;
    }
  }

  async getBanks() {
    try {
      const response = await axios.get(`${this.baseUrl}/bank`, { headers: this.headers });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to fetch banks', error.message);
      throw error;
    }
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: this.headers },
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to resolve account number', error.response?.data || error.message);
      throw error;
    }
  }

  verifySignature(signature: string, payload: any): boolean {
    const crypto = require('crypto');
    const secret = this.configService.get('PAYSTACK_SECRET_KEY');
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signature;
  }
}
