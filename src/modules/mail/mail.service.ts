import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromAddress: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY not found. Emails will not be sent.');
    }
    this.fromAddress = this.configService.get<string>('MAIL_FROM') || 'CampusLink <onboarding@resend.dev>';
  }

  /**
   * Generic email sender — used by all modules.
   */
  async sendMail(to: string, subject: string, html: string) {
    if (!this.resend) return;

    try {
      const result = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  /**
   * Welcome email triggered after successful signup.
   */
  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 24px; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 900;">Welcome to CampusLink!</h1>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Your campus marketplace journey starts now.</p>
        </div>
        <div style="background: white; border-radius: 20px; padding: 32px; margin-top: 16px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b;">Hey <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Thanks for joining the CampusLink ecosystem! You can now promote products on your campus,
            earn commissions on every sale, and withdraw your earnings anytime.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="#" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Start Promoting
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">You're receiving this because you created a CampusLink account.</p>
        </div>
      </div>
    `;
    return this.sendMail(to, 'Welcome to CampusLink! 🎉', html);
  }

  /**
   * Order confirmation email.
   */
  async sendOrderConfirmation(to: string, orderRef: string, amount: number) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Order Confirmed ✅</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Your order <strong>#${orderRef}</strong> has been confirmed.
          </p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 16px 0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">Total</p>
            <p style="font-size: 28px; font-weight: 900; color: #1e293b; margin: 4px 0;">₦${amount.toLocaleString()}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">CampusLink — Promote & Earn</p>
        </div>
      </div>
    `;
    return this.sendMail(to, `Order #${orderRef} Confirmed`, html);
  }

  /**
   * Withdrawal processed email.
   */
  async sendWithdrawalProcessed(to: string, amount: number) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Withdrawal Processed 💰</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been processed and should arrive in your bank account shortly.
          </p>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">CampusLink — Promote & Earn</p>
        </div>
      </div>
    `;
    return this.sendMail(to, 'Withdrawal Processed ✅', html);
  }
}
