"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let MailService = MailService_1 = class MailService {
    configService;
    resend;
    logger = new common_1.Logger(MailService_1.name);
    fromAddress;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
        }
        else {
            this.logger.warn('RESEND_API_KEY not found. Emails will not be sent.');
        }
        this.fromAddress = this.configService.get('MAIL_FROM') || 'CampusLink <onboarding@resend.dev>';
    }
    async sendMail(to, subject, html) {
        if (!this.resend)
            return;
        try {
            const result = await this.resend.emails.send({
                from: this.fromAddress,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
        }
    }
    async sendWelcomeEmail(to, name) {
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
    async sendOrderConfirmation(to, orderRef, amount) {
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
    async sendWithdrawalProcessed(to, amount) {
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
    async sendPasswordResetEmail(to, name, resetUrl) {
        const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 20px; padding: 40px; border: 1px solid #e2e8f0; text-align: center;">
          <h2 style="color: #1e293b; margin: 0 0 12px; font-weight: 800;">Reset your password</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
            Hi ${name}, we received a request to reset your CampusLink password. Click the button below to choose a new one. This link expires in 15 minutes.
          </p>
          <a href="${resetUrl}" style="background: #1e293b; color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
          <p style="font-size: 11px; color: #cbd5e1;">CampusLink Technologies — Empowering students nationwide.</p>
        </div>
      </div>
    `;
        return this.sendMail(to, 'Reset your CampusLink password', html);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map