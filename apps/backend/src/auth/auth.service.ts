import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupRequestDto } from './dto/signup.request.dto';
import * as argon2 from 'argon2';
import { terms_status } from '@prisma/client';
import * as crypto from 'crypto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as process from 'node:process';
import { formatInTimeZone } from 'date-fns-tz';
import * as bcrypt from 'bcrypt';
import { addMinutes } from 'date-fns';
import { MailService } from '../mail/mail.service';

type MsString =
    | `${number}${'ms'|'s'|'m'|'h'|'d'}`
    | `${number} ${'milliseconds'|'seconds'|'minutes'|'hours'|'days'}`;

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService
    ) {}

    // 회원가입 및 약관 동의 저장
    async signupAndConsent(dto: SignupRequestDto) {
        const phoneDigits = this.normalizePhone(dto.phone);
        const passwordHash = await argon2.hash(dto.password);

        // 중복 검사
        const dup = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    { userId: dto.userId },
                    { phone: phoneDigits },
                    ...(dto.email ? [{ email: dto.email }] : []),
                ],
            },
            select: { userId: true, phone: true, email: true },
        });
        if (dup) {
            if (dup.userId === dto.userId)
                throw new ConflictException('이미 사용 중인 아이디입니다.');
            if (dup.phone === phoneDigits)
                throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
            if (dto.email && dup.email === dto.email)
                throw new ConflictException('이미 가입된 이메일입니다.');
        }

        const emailVerify = await this.prismaService.emailVerification.findUnique({
            where: { email: dto.email },
        });

        if (!emailVerify || !emailVerify.verifiedAt) {
            throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
        }

        try {
            const created = await this.prismaService.$transaction(
                async (tx) => {
                    const user = await tx.user.create({
                        data: {
                            userId: dto.userId,
                            name: dto.name,
                            phone: phoneDigits,
                            email: dto.email ?? null,
                            passwordHash,
                        },
                        select: { userId: true },
                    });

                    // 2) 동의 저장 (privacy, tos 등 전달된 termsId 각각)
                    const now = new Date();
                    for (const c of dto.consents) {
                        const termsIdNum = BigInt(c.termsId);
                        const t = await tx.terms.findUnique({
                            where: { termsId: termsIdNum },
                        });
                        if (!t)
                            throw new NotFoundException(
                                `약관이 존재하지 않습니다. termsId=${c.termsId}`,
                            );

                        // 운영 정책: 공개 & 시행본만 허용
                        if (
                            !(
                                t.status === terms_status.PUBLISHED &&
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

                        await tx.userConsent.create({
                            data: {
                                userId: user.userId, // 문자열 FK
                                termsId: t.termsId, // bigint
                                termsVersion: t.version,
                                contentSnapshot: snapshot || null,
                                contentHash,
                            },
                        });
                    }
                    return user;
                },
            );

            return { ok: true, userId: created.userId };
        } catch (e: any) {
            if (e?.code === 'P2002') {
                const target = Array.isArray(e.meta?.target)
                    ? e.meta.target.join(',')
                    : String(e.meta?.target ?? '');
                if (target.includes('user_id'))
                    return Promise.reject(
                        new ConflictException('이미 사용 중인 아이디입니다.'),
                    );
                if (target.includes('phone'))
                    return Promise.reject(
                        new ConflictException('이미 가입된 휴대폰 번호입니다.'),
                    );
                if (target.includes('email'))
                    return Promise.reject(
                        new ConflictException('이미 가입된 이메일입니다.'),
                    );
                return Promise.reject(
                    new ConflictException('중복된 사용자 정보가 있습니다.'),
                );
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
        // 사용자 입력 데이터 검증
        const user = await this.validateUser(userId, password);

        // 1) 해당 디바이스에 유효한 RT가 있는지 확인
        const existing = await this.prismaService.refreshToken.findFirst({
            where: {
                userId: user.userId,
                deviceId,
                revokedAt: null,
                expiryDate: { gt: new Date() },
            },
        });

        // 정책:
        // - DB에 유효 RT가 없으면 → 회전(신규 발급)
        // - 유효 RT가 있어도 "쿠키 RT가 없었음" → 회전(정합성 복구)
        // - 유효 RT가 있고 "쿠키 RT가 있었음" → 재사용(회전 X)
        const mustRotate = !existing || !hadRtCookie

        let refreshToken: string | undefined;

        if (mustRotate) {
            if (existing) {
                await this.prismaService.refreshToken.update({
                    where: { tokenId: existing.tokenId },
                    data: { revokedAt: new Date() },
                });
            }

            const { token, jti } = await this.signRefresh(
                user.userId,
                deviceId,
            );
            const hashed: string = await argon2.hash(token);

            const ms: number = this.ttlMs(
                process.env.JWT_REFRESH_EXPIRES ?? '30d',
            );
            const expiryUtc = new Date(Date.now() + ms); // UTC 권장

            await this.prismaService.refreshToken.upsert({
                where: { userId_deviceId: { userId: user.userId, deviceId } },
                update: {
                    jti,
                    tokenHash: hashed,
                    expiryDate: expiryUtc,
                    revokedAt: null,
                },
                create: {
                    userId: user.userId,
                    deviceId,
                    jti,
                    tokenHash: hashed,
                    expiryDate: expiryUtc,
                },
            });

            refreshToken = token; // 회전/신규 발급 시에만 평문 반환
        } else {
            // 정상 일치 → 감사 정보만 (선택)
            await this.prismaService.refreshToken.update({
                where: { tokenId: existing!.tokenId },
                data: { lastUsedAt: new Date() },
            });
        }

        const accessToken = await this.signAccessToken(user);

        return { user, accessToken, ...(refreshToken ? { refreshToken } : {}) };
    }

    // 사용자 검증
    private async validateUser(userId: string, password: string) {
        const user = await this.prismaService.user.findUnique({
            where: { userId },
        });
        if (!user)
            throw new UnauthorizedException(
                '아이디 또는 비밀번호가 일치하지 않습니다.',
            );

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok)
            throw new UnauthorizedException(
                '아이디 또는 비밀번호가 일치하지 않습니다.',
            );

        return user;
    }

    // 토큰
    private async signAccessToken(user: any) {
        const sub: string = user.userId;
        const name: string = user.name;
        const role: string = user.role;
        const approval: string = user.approval;

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

    async rotate(userId: string, deviceId: string, oldRt: string) {
        // 새 토큰 준비
        const { token: newRt, jti } = await this.signRefresh(userId, deviceId);
        const newHash = await argon2.hash(newRt);
        const ms = this.ttlMs(process.env.JWT_REFRESH_EXPIRES ?? '30d');
        const expiryUtc = new Date(Date.now() + ms);

        await this.prismaService.$transaction(async (tx) => {
            // 1) oldRt가 일치하는 활성 레코드만 선별적으로 revoke (방어적)
            const candidate = await tx.refreshToken.findFirst({
                where: {
                    userId,
                    deviceId,
                    revokedAt: null,
                    expiryDate: { gt: new Date() },
                },
            });

            if (candidate) {
                const same = await argon2.verify(candidate.tokenHash, oldRt).catch(() => false);
                if (same) {
                    await tx.refreshToken.update({
                        where: { tokenId: candidate.tokenId },
                        data: { revokedAt: new Date() },
                    });
                } else {
                    // 재사용/불일치 의심 시 정책에 따라 더 강하게 막을 수도 있음
                    // 여기서는 조용히 넘어가되, 별도 로깅/알림 추천
                }
            }

            // 2) 새 RT 저장(기기별 단일 RT 보장)
            await tx.refreshToken.upsert({
                where: { userId_deviceId: { userId, deviceId } },
                update: { jti, tokenHash: newHash, expiryDate: expiryUtc, revokedAt: null, lastUsedAt: new Date() },
                create: { userId, deviceId, jti, tokenHash: newHash, expiryDate: expiryUtc, lastUsedAt: new Date() },
            });
        });

        // 3) 새 AT 발급
        const accessToken = await this.signAccessToken({ userId });

        return { accessToken, refreshToken: newRt };

    }

    async logoutByRt(userId: string, incomingRt: string) {
        if (incomingRt) {
            const list = await this.prismaService.refreshToken.findMany({
                where: { userId },
            });
            for (const t of list) {
                if (
                    await argon2.verify(
                        await argon2.hash(incomingRt),
                        t.tokenHash,
                    )
                ) {
                    await this.prismaService.refreshToken.delete({
                        where: { tokenId: t.tokenId },
                    });
                    return;
                }
            }
        }
        await this.prismaService.refreshToken.deleteMany({ where: { userId } });
    }

    async sendEmailVerification(email: string) {
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if (user) throw new BadRequestException("이미 이메일 인증이 완료된 계정입니다.");

        // 인증코드 생성
        const code = this.generateCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = addMinutes(new Date(), 3); // 5분 유효 (원하시는 대로 조정)

        // EmailVerification upsert: 이메일당 1건만 유지
        await this.prismaService.emailVerification.upsert({
            where: { email },
            update: {
                codeHash,
                expiresAt,
                requestedAt: new Date(),
                verifiedAt: null,
                tryCount: 0,
            },
            create: {
                email,
                codeHash,
                expiresAt,
            },
        });

        // 실제 이메일 발송 (MailService는 이미 가지고 있다고 가정)
        await this.mailService.sendEmailVerificationCode(email, code);
    }

    /** 6자리 숫자 코드 생성 */
    private generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async confirmEmailVerification(email: string, code: string) {
        const verification = await this.prismaService.emailVerification.findUnique({
            where: { email },
        });

        if (!verification) {
            throw new BadRequestException('인증 요청 내역이 없습니다. 인증번호를 다시 요청해 주세요.');
        }

        // 이미 인증된 경우
        if (verification.verifiedAt) {
            throw new BadRequestException('이미 이메일 인증이 완료되었습니다.');
        }

        // 만료 체크 (서버 기준)
        const now = new Date();
        if (verification.expiresAt < now) {
            throw new BadRequestException(
                '인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.',
            );
        }

        // 시도 횟수 제한
        if (verification.tryCount >= 5) {
            throw new ForbiddenException(
                '인증 시도 횟수를 초과했습니다. 인증번호를 다시 요청해 주세요.',
            );
        }

        // 코드 비교
        const isMatch = await bcrypt.compare(code, verification.codeHash);
        if (!isMatch) {
            // 틀리면 tryCount 증가
            await this.prismaService.emailVerification.update({
                where: { email },
                data: { tryCount: { increment: 1 } },
            });
            throw new BadRequestException('인증번호가 일치하지 않습니다.');
        }

        // ✅ 성공: 트랜잭션으로 EmailVerification + User 같이 업데이트
        // 1) 인증 기록 업데이트
        await this.prismaService.emailVerification.update({
            where: { email },
            data: {
                verifiedAt: now,
                tryCount: verification.tryCount, // 그대로 두거나 0으로 초기화 선택 가능
            },
        });
    }
}