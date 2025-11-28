// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';
import { EmailVerification } from './email-verification.entity';
import { UserConsent } from './user-consent.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { ConfigModule } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { Terms } from '../terms/terms.entity';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
        }),
        ConfigModule, MailModule,
        TypeOrmModule.forFeature([User, RefreshToken, EmailVerification, UserConsent, Terms])
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, MailService],
    controllers: [AuthController],
})
export class AuthModule {}