import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KellyImage } from './kelly-image.entity';
import { KellyService } from './kelly.service';
import { KellyController } from './kelly.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule.register({timeout: 15000, maxRedirects: 3}),
        TypeOrmModule.forFeature([KellyImage])
  ],
    controllers: [KellyController],
    providers: [KellyService],
})
export class KellyModule {}