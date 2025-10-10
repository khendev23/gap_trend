import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // 필요 시 로깅 옵션 추가 가능: super({ log: ['query', 'error', 'warn'] })
  async onModuleInit() {
    await this.$connect()
  }

  // 애플리케이션 종료 신호 시 Prisma 연결 종료
  async onModuleDestroy() {
    await this.$disconnect();
  }
}