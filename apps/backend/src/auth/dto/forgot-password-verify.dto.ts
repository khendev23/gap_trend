import { IsEmail, IsString, Length } from 'class-validator';

export class ForgotPasswordVerifyDto {
    @IsString()
    userId: string;

    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    code: string;
}