"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../../schemas/user.schema");
const firebase_service_1 = require("../firebase/firebase.service");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    userModel;
    jwtService;
    firebaseService;
    mailService;
    constructor(userModel, jwtService, firebaseService, mailService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.firebaseService = firebaseService;
        this.mailService = mailService;
    }
    async firebaseLogin(idToken, role) {
        const decodedToken = await this.firebaseService.verifyIdToken(idToken);
        const { email, uid, name, picture } = decodedToken;
        if (!email) {
            throw new common_1.BadRequestException('Email not found in social account');
        }
        let user = await this.userModel.findOne({
            $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
        });
        if (!user) {
            user = await this.userModel.create({
                email: email.toLowerCase(),
                name: name || email.split('@')[0],
                firebaseUid: uid,
                avatar: picture || '',
                role: role || user_schema_1.UserRole.STUDENT,
                isActive: true,
            });
            this.mailService.sendWelcomeEmail(email, user.name).catch(() => { });
        }
        else if (!user.firebaseUid) {
            user.firebaseUid = uid;
            if (!user.avatar && picture)
                user.avatar = picture;
            await user.save();
        }
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async signup(dto) {
        const existing = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const user = await this.userModel.create({
            ...dto,
            email: dto.email.toLowerCase(),
            password: hashedPassword,
        });
        this.mailService
            .sendWelcomeEmail(user.email, user.name || dto.name)
            .catch(() => { });
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .populate('campus');
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Please login with your social account');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            token,
        };
    }
    async getProfile(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password')
            .populate('campus')
            .lean();
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: dto }, { new: true })
            .select('-password')
            .populate('campus')
            .lean();
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!user.password) {
            throw new common_1.BadRequestException('Account does not have a local password. Please use social login.');
        }
        const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(dto.newPassword, salt);
        await user.save();
        return { message: 'Password changed successfully' };
    }
    async validateUserById(userId) {
        return this.userModel.findById(userId).select('-password').lean();
    }
    async forgotPassword(dto) {
        const user = await this.userModel.findOne({
            email: dto.email.toLowerCase(),
        });
        if (!user) {
            return {
                message: 'If an account with that email exists, we sent a password reset link.',
            };
        }
        if (!user.password) {
            return {
                message: 'This account uses Google sign-in. Please log in with Google instead.',
            };
        }
        const resetToken = this.jwtService.sign({ sub: user._id, email: user.email, type: 'password_reset' }, { expiresIn: '15m' });
        const resetUrl = `${process.env.STUDENT_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;
        try {
            await this.mailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
        }
        catch (e) {
            console.error('Failed to send reset email:', e.message);
        }
        return {
            message: 'If an account with that email exists, we sent a password reset link.',
        };
    }
    async resetPassword(dto) {
        try {
            const decoded = this.jwtService.verify(dto.token);
            if (decoded.type !== 'password_reset') {
                throw new common_1.BadRequestException('Invalid reset token.');
            }
            const user = await this.userModel.findById(decoded.sub);
            if (!user) {
                throw new common_1.BadRequestException('User not found.');
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(dto.newPassword, salt);
            await user.save();
            return {
                message: 'Password has been reset successfully. You can now sign in.',
            };
        }
        catch (e) {
            if (e instanceof common_1.BadRequestException)
                throw e;
            throw new common_1.BadRequestException('Reset link has expired or is invalid. Please request a new one.');
        }
    }
    generateToken(user) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }
    sanitizeUser(user) {
        const obj = user.toObject ? user.toObject() : user;
        delete obj.password;
        return obj;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        firebase_service_1.FirebaseService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map