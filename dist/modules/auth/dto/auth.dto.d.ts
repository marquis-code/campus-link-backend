import { UserRole } from '../../../schemas/user.schema';
export declare class SignupDto {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    campus: string;
    password: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    avatar?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
