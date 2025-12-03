import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordResetDto {
    @IsString()
    userId: string;

    @IsEmail()
    email: string;

    @IsString()
    newPassword: string;
}