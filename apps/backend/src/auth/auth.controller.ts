// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SignupResponseDto } from './dto/signup.response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

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
}