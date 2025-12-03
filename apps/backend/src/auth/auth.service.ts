import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    DataSource,
    Repository,
    MoreThan,
    IsNull,
    QueryFailedError,
} from 'typeorm';

import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { addMinutes } from 'date-fns';
import * as process from 'node:process';

import { SignupRequestDto } from './dto/signup.request.dto';
import { MailService } from '../mail/mail.service';

import { User } from './user.entity';
import { Terms } from '../terms/terms.entity';
import { TermsStatus } from '../terms/terms.enums';
import { UserConsent } from './user-consent.entity';
import { RefreshToken } from './refresh-token.entity';
import { EmailVerification } from './email-verification.entity';

type MsString =
    | `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`
    | `${number} ${'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'}`;

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly dataSource: DataSource,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Terms)
        private readonly termsRepo: Repository<Terms>,

        @InjectRepository(UserConsent)
        private readonly userConsentRepo: Repository<UserConsent>,

        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,

        @InjectRepository(EmailVerification)
        private readonly emailVerificationRepo: Repository<EmailVerification>,
    ) {}

    // 회원가입 및 약관 동의 저장
    async signupAndConsent(dto: SignupRequestDto) {
        const phoneDigits = this.normalizePhone(dto.phone);
        const passwordHash = await argon2.hash(dto.password);

        // 중복 검사
        const dup = await this.userRepo.findOne({
            where: [
                { userId: dto.userId },
                { phone: phoneDigits },
                ...(dto.email ? [{ email: dto.email }] : []),
            ],
            select: { userId: true, phone: true, email: true },
        });

        if (dup) {
            if (dup.userId === dto.userId) {
                throw new ConflictException('이미 사용 중인 아이디입니다.');
            }
            if (dup.phone === phoneDigits) {
                throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
            }
            if (dto.email && dup.email === dto.email) {
                throw new ConflictException('이미 가입된 이메일입니다.');
            }
        }

        const emailVerify = await this.emailVerificationRepo.findOne({
            where: { email: dto.email ?? '' },
        });

        if (!emailVerify || !emailVerify.verifiedAt) {
            throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
        }

        try {
            const created = await this.dataSource.transaction(async (manager) => {
                const user = await manager.getRepository(User).save({
                    userId: dto.userId,
                    name: dto.name,
                    phone: phoneDigits,
                    email: dto.email ?? null,
                    passwordHash,
                });

                const termsRepo = manager.getRepository(Terms);
                const userConsentRepo = manager.getRepository(UserConsent);

                const now = new Date();

                for (const c of dto.consents) {
                    const termsIdNum = BigInt(c.termsId);

                    const t = await termsRepo.findOne({
                        where: { termsId: termsIdNum as any },
                    });

                    if (!t) {
                        throw new NotFoundException(
                            `약관이 존재하지 않습니다. termsId=${c.termsId}`,
                        );
                    }

                    // 운영 정책: 공개 & 시행본만 허용
                    if (
                        !(
                            t.status === TermsStatus.PUBLISHED &&
                            t.effectiveAt <= now
                        )
                    ) {
                        throw new ConflictException(
                            `아직 시행 전이거나 공개되지 않은 약관입니다. termsId=${c.termsId}`,
                        );
                    }

                    const snapshot = t.contentHtml ?? t.contentMd ?? '';
                    const contentHash = crypto
                        .createHash('sha256')
                        .update(snapshot, 'utf8')
                        .digest('hex');

                    await userConsentRepo.save({
                        userId: user.userId,
                        termsId: t.termsId,
                        termsVersion: t.version,
                        contentSnapshot: snapshot || null,
                        contentHash,
                    });
                }

                return user;
            });

            return { ok: true, userId: created.userId };
        } catch (e: any) {
            // Prisma P2002 대신 MySQL/MariaDB의 ER_DUP_ENTRY 등 처리
            if (e instanceof QueryFailedError && (e as any).code === 'ER_DUP_ENTRY') {
                // 에러 메시지 안에 어떤 unique 키인지 포함되어 있을 수 있음
                const msg = String((e as any).sqlMessage ?? e.message ?? '');
                if (msg.includes('user.PRIMARY') || msg.includes('user_id')) {
                    throw new ConflictException('이미 사용 중인 아이디입니다.');
                }
                if (msg.includes('phone')) {
                    throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
                }
                if (msg.includes('email')) {
                    throw new ConflictException('이미 가입된 이메일입니다.');
                }
                throw new ConflictException('중복된 사용자 정보가 있습니다.');
            }
            throw e;
        }
    }

    private normalizePhone(phone: string) {
        const digits = phone.replace(/\D/g, '');
        if (!(digits.length === 10 || digits.length === 11)) {
            throw new BadRequestException(
                '휴대폰 번호 길이가 올바르지 않습니다.',
            );
        }
        return digits;
    }

    // 로그인
    async login(
        userId: string,
        password: string,
        deviceId: string,
        hadRtCookie: boolean | undefined,
    ) {
        const user = await this.validateUser(userId, password);

        // 해당 디바이스에 유효한 RT가 있는지 확인
        const existing = await this.refreshTokenRepo.findOne({
            where: {
                userId: user.userId,
                deviceId,
                revokedAt: IsNull(),
                expiryDate: MoreThan(new Date()),
            },
        });

        const mustRotate = !existing || !hadRtCookie;
        let refreshToken: string | undefined;

        if (mustRotate) {
            if (existing) {
                await this.refreshTokenRepo.update(
                    { tokenId: existing.tokenId },
                    { revokedAt: new Date() },
                );
            }

            const { token, jti } = await this.signRefresh(
                user.userId,
                deviceId,
            );
            const hashed = await argon2.hash(token);

            const ms = this.ttlMs(
                process.env.JWT_REFRESH_EXPIRES ?? '30d',
            );
            const expiryUtc = new Date(Date.now() + ms);

            await this.refreshTokenRepo.upsert(
                {
                    userId: user.userId,
                    deviceId,
                    jti,
                    tokenHash: hashed,
                    expiryDate: expiryUtc,
                    revokedAt: null,
                },
                ['userId', 'deviceId'],
            );

            refreshToken = token;
        } else {
            await this.refreshTokenRepo.update(
                { tokenId: existing!.tokenId },
                { lastUsedAt: new Date() },
            );
        }

        const accessToken = await this.signAccessToken(user);

        return { user, accessToken, ...(refreshToken ? { refreshToken } : {}) };
    }

    // 사용자 검증
    private async validateUser(userId: string, password: string) {
        const user = await this.userRepo.findOne({
            where: { userId },
        });
        if (!user) {
            throw new UnauthorizedException(
                '아이디 또는 비밀번호가 일치하지 않습니다.',
            );
        }

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) {
            throw new UnauthorizedException(
                '아이디 또는 비밀번호가 일치하지 않습니다.',
            );
        }

        return user;
    }

    // Access Token
    private async signAccessToken(user: User) {
        const sub = user.userId;
        const name = user.name;
        const role = user.role;
        const approval = user.approvalStatus;

        const accessPayload: Record<string, unknown> = {
            sub,
            name,
            role,
            approval,
        };

        const ACCESS_EXPIRES: MsString = (process.env.JWT_ACCESS_EXPIRES ??
            '30m') as MsString;

        const accessOpts: JwtSignOptions = {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: ACCESS_EXPIRES,
        };

        return await this.jwtService.signAsync(accessPayload, accessOpts);
    }

    private async signRefresh(userId: string, deviceId: string) {
        const REFRESH_EXPIRES: MsString = (process.env.JWT_REFRESH_EXPIRES ??
            '30d') as MsString;
        const jti = crypto.randomUUID();
        const payload = { sub: userId, jti, deviceId };
        const refreshOpts: JwtSignOptions = {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: REFRESH_EXPIRES,
        };
        const token = await this.jwtService.signAsync(payload, refreshOpts);
        return { token, jti };
    }

    private ttlMs(expr: string) {
        if (expr.endsWith('d')) return parseInt(expr) * 24 * 60 * 60 * 1000;
        if (expr.endsWith('m')) return parseInt(expr) * 60 * 1000;
        return 30 * 24 * 60 * 60 * 1000;
    }

    // RT 회전
    async rotate(userId: string, deviceId: string, oldRt: string) {
        const { token: newRt, jti } = await this.signRefresh(userId, deviceId);
        const newHash = await argon2.hash(newRt);
        const ms = this.ttlMs(process.env.JWT_REFRESH_EXPIRES ?? '30d');
        const expiryUtc = new Date(Date.now() + ms);

        await this.dataSource.transaction(async (manager) => {
            const rtRepo = manager.getRepository(RefreshToken);

            const candidate = await rtRepo.findOne({
                where: {
                    userId,
                    deviceId,
                    revokedAt: IsNull(),
                    expiryDate: MoreThan(new Date()),
                },
            });

            if (candidate) {
                const same = await argon2
                    .verify(candidate.tokenHash, oldRt)
                    .catch(() => false);

                if (same) {
                    await rtRepo.update(
                        { tokenId: candidate.tokenId },
                        { revokedAt: new Date() },
                    );
                } else {
                    // 재사용/불일치 의심 시 로깅 등 추가 가능
                }
            }

            await rtRepo.upsert(
                {
                    userId,
                    deviceId,
                    jti,
                    tokenHash: newHash,
                    expiryDate: expiryUtc,
                    revokedAt: null,
                    lastUsedAt: new Date(),
                },
                ['userId', 'deviceId'],
            );
        });

        const accessToken = await this.signAccessToken(
            await this.userRepo.findOneByOrFail({ userId }),
        );

        return { accessToken, refreshToken: newRt };
    }

    // 로그아웃 (RT 기준)
    async logoutByRt(userId: string, incomingRt: string) {
        if (incomingRt) {
            const list = await this.refreshTokenRepo.find({
                where: { userId },
            });

            for (const t of list) {
                // 원 코드의 흐름 유지 (다만 이 부분은 hash 비교 로직을 점검해도 좋음)
                if (
                    await argon2.verify(
                        await argon2.hash(incomingRt),
                        t.tokenHash,
                    )
                ) {
                    await this.refreshTokenRepo.delete({ tokenId: t.tokenId });
                    return;
                }
            }
        }

        await this.refreshTokenRepo.delete({ userId });
    }

    // 이메일 인증 코드 발송
    async sendEmailVerification(email: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (user) {
            throw new BadRequestException(
                '이미 이메일 인증이 완료된 계정입니다.',
            );
        }

        const code = this.generateCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = addMinutes(new Date(), 3); // 3분 유효

        await this.emailVerificationRepo.upsert(
            {
                email,
                codeHash,
                expiresAt,
                requestedAt: new Date(),
                verifiedAt: null,
                tryCount: 0,
            },
            ['email'],
        );

        await this.mailService.sendEmailVerificationCode(email, code);
    }

    /** 6자리 숫자 코드 생성 */
    private generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 이메일 인증 확인
    async confirmEmailVerification(email: string, code: string) {
        const verification = await this.emailVerificationRepo.findOne({
            where: { email },
        });

        if (!verification) {
            throw new BadRequestException(
                '인증 요청 내역이 없습니다. 인증번호를 다시 요청해 주세요.',
            );
        }

        if (verification.verifiedAt) {
            throw new BadRequestException('이미 이메일 인증이 완료되었습니다.');
        }

        const now = new Date();
        if (verification.expiresAt < now) {
            throw new BadRequestException(
                '인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.',
            );
        }

        if (verification.tryCount >= 5) {
            throw new ForbiddenException(
                '인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해 주세요.',
            );
        }

        const isMatch = await bcrypt.compare(code, verification.codeHash);
        if (!isMatch) {
            await this.emailVerificationRepo.update(
                { email },
                { tryCount: verification.tryCount + 1 },
            );

            throw new BadRequestException('인증번호가 일치하지 않습니다.');
        }

        await this.emailVerificationRepo.update(
            { email },
            {
                verifiedAt: now,
                tryCount: verification.tryCount,
            },
        );
    }

    async findUserByIdAndEmail(userId: string, email: string) {
        const trimmedId = userId?.trim();
        const trimmedEmail = email?.trim();

        if (!trimmedId || !trimmedEmail) {
            throw new BadRequestException(
                '아이디와 이메일을 모두 입력해 주세요.',
            );
        }

        return this.userRepo.findOne({
            where: {
                userId: trimmedId,
                email: trimmedEmail,
            },
        });
    }

    async sendPasswordResetCode(email: string, userId: string) {
        const user = await this.userRepo.findOne({
            where: { userId, email },
        });

        if (!user) {
            throw new NotFoundException('일치하는 계정을 찾을 수 없습니다.');
        }

        // 1) 코드 생성
        const code = this.generateCode(); // 6자리 숫자
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = addMinutes(new Date(), 3); // 3분 유효

        // 2) EmailVerification(재사용) 업데이트
        await this.emailVerificationRepo.upsert(
            {
                email,
                codeHash,
                expiresAt,
                requestedAt: new Date(),
                verifiedAt: null,  // reset flow니까 항상 null
                tryCount: 0,       // reset인 만큼 초기화
            },
            ['email'],
        );

        // 3) 메일 발송
        await this.mailService.sendPasswordResetCode(email, code);

        return { ok: true };
    }

    async resetPassword(userId: string, email: string, newPassword: string) {
        const newHash = await argon2.hash(newPassword.trim());
        const now = new Date();

        await this.userRepo.update(
            { userId: userId },
            { passwordHash: newHash },
        );

        // 인증 정보 무효화
        await this.emailVerificationRepo.update(
            { email: email },
            {
                verifiedAt: now,   // 이미 있지만 다시 기록
                expiresAt: now,    // 즉시 만료
                tryCount: 0,
            },
        );

        // 기존 Refresh Token 모두 무효화
        await this.refreshTokenRepo.update(
            { userId: userId },
            { revokedAt: new Date() },
        );

        return { ok: true };
    }
}
