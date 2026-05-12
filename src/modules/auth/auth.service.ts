import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../../schemas/user.schema';
import { SignupDto, LoginDto, UpdateProfileDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

import { FirebaseService } from '../firebase/firebase.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private mailService: MailService,
  ) {}

  async firebaseLogin(idToken: string, role?: string) {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    const { email, uid, name, picture } = decodedToken;

    if (!email) {
      throw new BadRequestException('Email not found in social account');
    }

    let user = await this.userModel.findOne({ 
      $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] 
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.userModel.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        firebaseUid: uid,
        avatar: picture || '',
        role: (role as UserRole) || UserRole.STUDENT, // Use provided role or default to STUDENT
        isActive: true,
      });
      // Fire-and-forget welcome email for social signup
      this.mailService.sendWelcomeEmail(email, user.name).catch(() => {});
    } else if (!user.firebaseUid) {
      // Link firebase account to existing email user
      user.firebaseUid = uid;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    const token = this.generateToken(user);
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async signup(dto: SignupDto) {
    // Check if user already exists
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Create user
    const user = await this.userModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    // Fire-and-forget welcome email
    this.mailService.sendWelcomeEmail(user.email, user.name || dto.name).catch(() => {});

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .populate('campus');

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please login with your social account');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('campus')
      .lean();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .select('-password')
      .populate('campus')
      .lean();

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Account does not have a local password. Please use social login.');
    }

    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(dto.newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async validateUserById(userId: string) {
    return this.userModel.findById(userId).select('-password').lean();
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account with that email exists, we sent a password reset link.' };
    }

    if (!user.password) {
      return { message: 'This account uses Google sign-in. Please log in with Google instead.' };
    }

    // Generate a short-lived reset token (15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user._id, email: user.email, type: 'password_reset' },
      { expiresIn: '15m' },
    );

    // Send reset email
    const resetUrl = `${process.env.STUDENT_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;
    
    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (e) {
      // Log but don't fail — the token is still valid
      console.error('Failed to send reset email:', e.message);
    }

    return { message: 'If an account with that email exists, we sent a password reset link.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const decoded = this.jwtService.verify(dto.token);
      
      if (decoded.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token.');
      }

      const user = await this.userModel.findById(decoded.sub);
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(dto.newPassword, salt);
      await user.save();

      return { message: 'Password has been reset successfully. You can now sign in.' };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Reset link has expired or is invalid. Please request a new one.');
    }
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;
    return obj;
  }
}
