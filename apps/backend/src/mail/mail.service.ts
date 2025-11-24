// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException  } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
// Nodemailer 등 사용

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true', // 465 포트면 true
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    /** 공통 메일 전송 함수 */
    private async sendMail(options: {
        to: string;
        subject: string;
        text?: string;
        html?: string;
    }) {
        try {
            await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                ...options,
            });
        } catch (error) {
            console.error('메일 전송 오류:', error);
            throw new InternalServerErrorException('메일 전송에 실패했습니다.');
        }
    }

    async sendEmailVerificationCode(to: string, code: string) {
        const subject = '은혜와평강교회 이메일 인증번호';
        const text = `인증번호는 ${code} 입니다. 3분 안에 입력해주세요.`;
        const html = `
            <div style="font-family: sans-serif;">
                <h2>은혜와평강교회 이메일 인증</h2>
                <p>아래 인증번호를 입력해주세요.</p>
                <div style="font-size: 24px; font-weight: bold; margin:16px 0;">
                    ${code}
                </div>
                <p>본 인증번호는 3분 동안 유효합니다.</p>
            </div>
        `;

        await this.sendMail({ to, subject, text, html });
    }
}
