// src/auth/dto/signup.request.dto.ts
import { IsString, IsOptional, IsEmail, Matches, MinLength, MaxLength, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SignupConsentItemDto {
    @IsString()
    termsId!: string; // bigint string
}

export class SignupRequestDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9]+$/, { message: '아이디는 영문과 숫자만 가능합니다.' })
    @MaxLength(30, { message: '아이디는 30자 이하로 입력해 주세요.' })
    userId!: string; // 로그인 아이디(=PK)

    @IsString()
    name!: string;

    @IsString()
    @Matches(/^\d{2,3}-?\d{3,4}-?\d{4}$/, { message: '휴대폰 번호 형식이 올바르지 않습니다.' })
    phone!: string; // 서버에서 숫자만 저장

    @IsString()
    @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
    @Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/, { message: '비밀번호는 특수문자를 1개 이상 포함해야 합니다.' })
    password!: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => SignupConsentItemDto)
    consents!: SignupConsentItemDto[];

    @IsOptional() userAgent?: string;
    @IsOptional() ipAddress?: string; // 보통은 서버에서 req.ip 사용 권장
}