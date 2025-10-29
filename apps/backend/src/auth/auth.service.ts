import {
    BadRequestException,
    ConflictException, ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {SignupRequestDto} from "./dto/signup.request.dto";
import * as argon2 from 'argon2';
import {terms_status} from "@prisma/client";
import * as crypto from "crypto";
import {JwtService, JwtSignOptions} from '@nestjs/jwt';
import * as process from 'node:process';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private readonly prismaService: PrismaService) {}

    // 회원가입 및 약관 동의 저장
    async signupAndConsent(dto:SignupRequestDto) {
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
            if (dup.userId === dto.userId) throw new ConflictException('이미 사용 중인 아이디입니다.');
            if (dup.phone === phoneDigits) throw new ConflictException('이미 가입된 휴대폰 번호입니다.');
            if (dto.email && dup.email === dto.email) throw new ConflictException('이미 가입된 이메일입니다.');
        }

        try {
            const created = await this.prismaService.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        userId: dto.userId,
                        name: dto.name,
                        phone: phoneDigits,
                        email: dto.email ?? null,
                        passwordHash,
                    },
                    select: { userId: true },
                })

                // 2) 동의 저장 (privacy, tos 등 전달된 termsId 각각)
                const now = new Date();
                for (const c of dto.consents) {
                    const termsIdNum = BigInt(c.termsId);
                    const t = await tx.terms.findUnique({where: {termsId: termsIdNum}});
                    if (!t) throw new NotFoundException(`약관이 존재하지 않습니다. termsId=${c.termsId}`);

                    // 운영 정책: 공개 & 시행본만 허용
                    if (!(t.status === terms_status.PUBLISHED && t.effectiveAt <= now)) {
                        throw new ConflictException(`아직 시행 전이거나 공개되지 않은 약관입니다. termsId=${c.termsId}`);
                    }

                    const snapshot = t.contentHtml ?? t.contentMd ?? '';
                    const contentHash = crypto.createHash('sha256').update(snapshot, 'utf8').digest('hex');

                    await tx.userConsent.create({
                        data: {
                            userId: user.userId,      // 문자열 FK
                            termsId: t.termsId,       // bigint
                            termsVersion: t.version,
                            contentSnapshot: snapshot || null,
                            contentHash,
                        },
                    });
                }
                return user;
            });

            return { ok: true, userId: created.userId };
        }
        catch(e:any) {
            if (e?.code === 'P2002') {
                const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target ?? '');
                if (target.includes('user_id')) return Promise.reject(new ConflictException('이미 사용 중인 아이디입니다.'));
                if (target.includes('phone'))   return Promise.reject(new ConflictException('이미 가입된 휴대폰 번호입니다.'));
                if (target.includes('email'))   return Promise.reject(new ConflictException('이미 가입된 이메일입니다.'));
                return Promise.reject(new ConflictException('중복된 사용자 정보가 있습니다.'));
            }
            throw e;
        }
    }

    private normalizePhone(phone:string) {
        const digits = phone.replace(/\D/g, '');
        if (!(digits.length === 10 || digits.length === 11)) {
            throw new BadRequestException('휴대폰 번호 길이가 올바르지 않습니다.');
        }
        return digits;
    }

    // 로그인
    async login(userId:string, password:string) {
        // 사용자 입력 데이터 검증
        const user = await this.validateUser(userId, password);

        // 토큰 발급
        const { accessToken, refreshToken } = await this.signTokens(user);

        // refreshToken 저장
        await this.saveRefresh(user.userId, refreshToken);
        return { user, accessToken, refreshToken };
    }

    // 사용자 검증
    private async validateUser(userId: string, password: string) {
        const user = await this.prismaService.user.findUnique({where: {userId}});
        if (!user) throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');

        return user;
    }

    // 토큰
    private async signTokens(user: any) {

        type MsString =
            | `${number}${'ms'|'s'|'m'|'h'|'d'}`
            | `${number} ${'milliseconds'|'seconds'|'minutes'|'hours'|'days'}`;

        const sub: string = user.userId;
        const username: string = user.userName;
        const role: string = user.role;
        const approval: string = user.approval;

        const accessPayload: Record<string, unknown> = { sub, username, role, approval };
        const refreshPayload: Record<string, unknown> = { sub, jti:crypto.randomUUID() };

        const ACCESS_EXPIRES: MsString = (process.env.JWT_ACCESS_EXPIRES ?? '30m') as MsString;
        const REFRESH_EXPIRES: MsString = (process.env.JWT_REFRESH_EXPIRES ?? '30d') as MsString;

        const accessOpts: JwtSignOptions = {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: ACCESS_EXPIRES
        }

        const refreshOpts: JwtSignOptions = {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: REFRESH_EXPIRES
        };

        const accessToken: string = await this.jwtService.signAsync(accessPayload, accessOpts);
        const refreshToken: string = await this.jwtService.signAsync(refreshPayload, refreshOpts);

        return { accessToken, refreshToken };
    }

    private async saveRefresh(userId: string, refreshToken: string) {
        const hashed = await argon2.hash(refreshToken);
        const ms = this.ttlMs(process.env.JWT_REFRESH_EXPIRES ?? '30d');
        const expiryDate = new Date(Date.now() + ms);
        await this.prismaService.refreshToken.upsert({
            where: { userId },
            update: { token: hashed, expiryDate },
            create: { userId, token: hashed, expiryDate },
        });
    }

    private ttlMs(expr: string) {
        if (expr.endsWith('d')) return parseInt(expr) * 24 * 60 * 60 * 1000;
        if (expr.endsWith('m')) return parseInt(expr) * 60 * 1000;
        return 30 * 24 * 60 * 60 * 1000;
    }

    async rotate(userId: string, incomingRt: string) {
        const list = await this.prismaService.refreshToken.findMany({
            where: { userId }, orderBy: { createdAt: 'desc' }, take: 10,
        });
        const matched = await (async () => {
            for (const t of list) {
                if (await argon2.verify(incomingRt, t.token) && t.expiryDate > new Date()) return t;
            }
            return null;
        })();
        if (!matched) throw new ForbiddenException('리프레시 토큰 불가');
        await this.prismaService.refreshToken.delete({ where: { tokenId: matched.tokenId } });

        const user = await this.prismaService.user.findUnique({ where: { userId } });
        const { accessToken, refreshToken } = await this.signTokens(user);
        await this.saveRefresh(userId, refreshToken);
        return { accessToken, refreshToken };
    }

    async logoutByRt(userId: string, incomingRt: string) {
        if (incomingRt) {
            const list = await this.prismaService.refreshToken.findMany({ where: { userId } });
            for (const t of list) {
                if (await argon2.verify(incomingRt, t.token)) {
                    await this.prismaService.refreshToken.delete({ where: { tokenId: t.tokenId } });
                    return;
                }
            }
        }
        await this.prismaService.refreshToken.deleteMany({ where: { userId } });
    }
}