// src/auth/auth.controller.ts
import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SignupResponseDto } from './dto/signup.response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard';
import * as argon2 from 'argon2';
import { Request } from 'express';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,

        // ✅ PrismaService 대신 TypeORM Repository 주입
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
    ) {}

    @Post('email/verify')
    async emailVerify(@Body() dto: SendEmailVerificationDto) {
        await this.authService.sendEmailVerification(dto.email);
        return { ok: true };
    }

    @Post('email/verify/confirm')
    async emailVerifyConfirm(@Body() dto: ConfirmEmailVerificationDto) {
        await this.authService.confirmEmailVerification(dto.email, dto.code);
        return { ok: true };
    }

    @Post('signup')
    async signup(@Body() dto: SignupRequestDto): Promise<SignupResponseDto> {
        return this.authService.signupAndConsent(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const { user, accessToken, refreshToken } =
            await this.authService.login(
                dto.userId,
                dto.password,
                dto.deviceId,
                dto.hadRtCookie,
            );

        return {
            user: {
                id: user.userId,
                username: user.name,
                role: user.role,
                approval: user.approvalStatus,
            },
            accessToken,
            refreshToken,
        };
    }

    @Post('refresh')
    async refresh(
        @Req() req: Request & { cookies?: Record<string, string> },
        @Body('refreshToken') rtFromBody?: string,
    ) {
        const rt = req.cookies?.refresh_token || rtFromBody;
        if (!rt) throw new UnauthorizedException('refresh 누락');

        let payload: { sub: string; deviceId?: string; jti?: string };
        try {
            payload = await this.jwtService.verifyAsync(rt, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch (e: any) {
            throw new UnauthorizedException('refresh 검증 실패');
        }
        const userId = payload.sub;

        // 2) DB의 활성 RT 레코드 조회 (TypeORM 버전)
        const candidates = await this.refreshTokenRepo.find({
            where: {
                userId,
                revokedAt: IsNull(),
                expiryDate: MoreThan(new Date()),
                ...(payload.deviceId ? { deviceId: payload.deviceId } : {}),
            },
        });

        // 3) 해시 일치하는 레코드 찾기
        let matched: RefreshToken | null = null;
        for (const c of candidates) {
            const ok = await argon2.verify(c.tokenHash, rt).catch(() => false);
            if (ok) {
                matched = c;
                break;
            }
        }

        // 3-1) 재사용(Reuse) 의심: 서명 OK인데 활성 일치 레코드 없음
        if (!matched) {
            await this.refreshTokenRepo.update(
                { userId },
                { revokedAt: new Date() },
            );
            throw new ForbiddenException('refresh 재사용 의심');
        }

        // 3-2) (선택) jti 일치도 확인
        if (payload.jti && matched.jti !== payload.jti) {
            await this.refreshTokenRepo.update(
                { userId, deviceId: matched.deviceId },
                { revokedAt: new Date() },
            );
            throw new ForbiddenException('refresh jti 불일치');
        }

        // 4) 회전: 기존 RT revoke → 새 RT 발급/저장
        await this.refreshTokenRepo.update(
            { tokenId: matched.tokenId },
            { revokedAt: new Date() },
        );

        const { accessToken, refreshToken } = await this.authService.rotate(
            userId,
            matched.deviceId,
            rt,
        );

        // 5) 새 토큰 반환(라우트 핸들러에서 Set-Cookie 처리)
        return { accessToken, refreshToken };
    }

    @Post('logout')
    async logout(
        @Body('refreshToken') rt: string,
        @Body('accessToken') at?: string,
    ) {
        let userId: any;
        if (at) {
            try {
                userId = (
                    await this.jwtService.verifyAsync(at, {
                        secret: process.env.JWT_ACCESS_SECRET,
                    })
                ).sub;
            } catch {}
        }
        if (!userId && rt) {
            try {
                userId = (
                    await this.jwtService.verifyAsync(rt, {
                        secret: process.env.JWT_REFRESH_SECRET,
                    })
                ).sub;
            } catch {}
        }
        if (!userId) throw new UnauthorizedException();
        await this.authService.logoutByRt(userId, rt);
        return { ok: true };
    }

    // 현재 로그인 사용자 정보
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return { user: req.user };
    }
}
