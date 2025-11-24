// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PrismaService} from "../../prisma/prisma.service";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
        }),
        PrismaModule, ConfigModule, MailModule
    ],
    providers: [PrismaService, AuthService, JwtStrategy, JwtAuthGuard, MailService],
    controllers: [AuthController],
})
export class AuthModule {}