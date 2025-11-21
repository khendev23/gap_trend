import { IsEmail, isEmail, IsString, Length } from 'class-validator';

export class ConfirmEmailVerificationDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    code: string;
}