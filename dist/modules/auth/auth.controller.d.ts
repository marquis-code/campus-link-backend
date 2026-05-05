import { AuthService } from './auth.service';
import { SignupDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        user: any;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    firebaseLogin(idToken: string): Promise<{
        user: any;
        token: string;
    }>;
    getProfile(userId: string): Promise<import("../../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<(import("../../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
