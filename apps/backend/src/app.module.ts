import { Module } from '@nestjs/common';
import { KellyModule } from './kelly/kelly.module';
import { PrismaModule } from '../prisma/prisma.module';
import {NoticeModule} from "./notice/notice.module";
import {TermsModule} from "./terms/terms.module";
import {AuthModule} from "./auth/auth.module";

@Module({
    imports: [
        PrismaModule,
        KellyModule,
        NoticeModule,
        TermsModule,
        AuthModule
    ],
})
export class AppModule {}
