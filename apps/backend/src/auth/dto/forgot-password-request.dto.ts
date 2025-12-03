import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
    @IsString()
    userId: string;

    @IsEmail()
    email: string;
}