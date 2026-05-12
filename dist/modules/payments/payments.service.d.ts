import { Model } from 'mongoose';
import { OrderDocument } from '../../schemas/order.schema';
import { WithdrawalDocument } from '../../schemas/withdrawal.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { WalletsService } from '../wallets/wallets.service';
export declare class PaymentsService {
    private orderModel;
    private withdrawalModel;
    private notificationsService;
    private mailService;
    private walletsService;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, withdrawalModel: Model<WithdrawalDocument>, notificationsService: NotificationsService, mailService: MailService, walletsService: WalletsService);
    handleWebhook(event: string, data: any): Promise<void>;
    private handleChargeSuccess;
    private handleTransferSuccess;
    private handleTransferFailed;
}
