// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PrismaService} from "../../prisma/prisma.service";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    providers: [PrismaService, AuthService, JwtStrategy, JwtAuthGuard],
    imports: [JwtModule.register({}), PrismaModule],
    controllers: [AuthController],
})
export class AuthModule {}