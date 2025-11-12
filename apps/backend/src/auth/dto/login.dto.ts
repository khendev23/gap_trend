import { IsBoolean, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    userId: string;

    @IsString()
    password: string;

    @IsString()
    deviceId: string;

    @IsBoolean()
    hadRtCookie?:boolean;
}