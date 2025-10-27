// src/auth/auth.controller.ts
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SignupResponseDto } from './dto/signup.response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService) {}

    @Post('signup')
    async signup(@Body() dto: SignupRequestDto): Promise<SignupResponseDto> {
        return this.authService.signupAndConsent(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const { user, accessToken, refreshToken } = await this.authService.login(dto.userId, dto.password);

        return {
            user: { id:user.userId, username: user.name, role: user.role, approval: user.approvalStatus},
            accessToken,
            refreshToken,
        };
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') rt: string) {
        if (!rt) throw new UnauthorizedException('refresh 누락');
        const decoded = await this.jwtService.verifyAsync(rt, { secret: process.env.JWT_REFRESH_SECRET });
        const { accessToken, refreshToken } = await this.authService.rotate(decoded.sub, rt);
        return { accessToken, refreshToken };
    }

    @Post('logout')
    async logout(@Body('refreshToken') rt: string, @Body('accessToken') at?: string) {
        let userId: any;
        if (at) {
            try { userId = (await this.jwtService.verifyAsync(at, { secret: process.env.JWT_ACCESS_SECRET })).sub; } catch {}
        }
        if (!userId && rt) {
            try { userId = (await this.jwtService.verifyAsync(rt, { secret: process.env.JWT_REFRESH_SECRET })).sub; } catch {}
        }
        if (!userId) throw new UnauthorizedException();
        await this.authService.logoutByRt(userId, rt);
        return { ok: true };
    }
}