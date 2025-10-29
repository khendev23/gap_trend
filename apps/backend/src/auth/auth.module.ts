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

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
        }),
        PrismaModule, ConfigModule
    ],
    providers: [PrismaService, AuthService, JwtStrategy, JwtAuthGuard],
    controllers: [AuthController],
})
export class AuthModule {}