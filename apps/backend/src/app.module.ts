import { Module } from '@nestjs/common';
import { KellyModule } from '../kelly/kelly.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    KellyModule,
  ],
})
export class AppModule {}
