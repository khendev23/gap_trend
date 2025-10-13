import { Module } from '@nestjs/common';
import { KellyModule } from '../kelly/kelly.module';
import { PrismaModule } from '../prisma/prisma.module';
import {NoticeModule} from "../notice/notice.module";

@Module({
  imports: [
    PrismaModule,
    KellyModule,
    NoticeModule,
  ],
})
export class AppModule {}
