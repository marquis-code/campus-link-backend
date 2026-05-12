export declare class CreateWithdrawalDto {
    amount: number;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    bankCode?: string;
}
export declare class UpdateWithdrawalStatusDto {
    status: string;
    adminNote?: string;
}
