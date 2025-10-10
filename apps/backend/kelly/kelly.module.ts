import { Module } from '@nestjs/common';
import { KellyService } from './kelly.service';
import { KellyController } from './kelly.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({timeout: 15000, maxRedirects: 3}),
  ],
  controllers: [KellyController],
  providers: [KellyService],
})
export class KellyModule {}