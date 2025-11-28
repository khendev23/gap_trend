import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { KellyModule } from './kelly/kelly.module';
import { NoticeModule } from './notice/notice.module';
import { TermsModule } from './terms/terms.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { KellyImage } from './kelly/kelly-image.entity';

@Module({
    imports: [
        // ✅ .env 로딩 (전역)
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        // ✅ TypeORM을 env 기반으로 설정
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql', // MariaDB도 mysql 타입 사용
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASS'),
                database: config.get<string>('DB_NAME'),
                entities: [KellyImage],
                synchronize: false,
            }),
        }),

        KellyModule,
        NoticeModule,
        TermsModule,
        AuthModule,
        MailModule,
    ],
})
export class AppModule {}
