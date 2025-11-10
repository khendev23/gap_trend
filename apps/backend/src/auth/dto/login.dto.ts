import { IsBoolean, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    userId: string;

    @IsString()
    password: string;

    @IsString()
    deviceId: string;

    @IsString()
    deviceType: 'mobile'|'tablet'|'desktop';

    @IsBoolean()
    hadRtCookie?:boolean;
}