import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  BadRequestException,
  HttpCode,
  Query,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaystackService } from '../../shared/services/paystack.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paystackService: PaystackService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Paystack signature');
    }

    const isValid = this.paystackService.verifySignature(signature, payload);
    if (!isValid) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    await this.paymentsService.handleWebhook(payload.event, payload.data);

    return { status: 'success' };
  }

  @Get('banks')
  @HttpCode(200)
  async getBanks() {
    return this.paystackService.getBanks();
  }

  @Get('resolve-account')
  @HttpCode(200)
  async resolveAccount(
    @Query('accountNumber') accountNumber: string,
    @Query('bankCode') bankCode: string,
  ) {
    return this.paystackService.resolveAccountNumber(accountNumber, bankCode);
  }

  @Get('verify-payment/:reference')
  @HttpCode(200)
  async verifyPayment(@Param('reference') reference: string) {
    const data = await this.paystackService.verifyTransaction(reference);
    if (data.status === 'success') {
      await this.paymentsService.handleWebhook('charge.success', data);
    }
    return data;
  }
}
