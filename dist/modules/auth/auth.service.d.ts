import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../../schemas/user.schema';
import { SignupDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private userModel;
    private jwtService;
    private firebaseService;
    private mailService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, firebaseService: FirebaseService, mailService: MailService);
    firebaseLogin(idToken: string): Promise<{
        user: any;
        token: string;
    }>;
    signup(dto: SignupDto): Promise<{
        user: any;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    getProfile(userId: string): Promise<User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<(User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    validateUserById(userId: string): Promise<(User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    private generateToken;
    private sanitizeUser;
}
