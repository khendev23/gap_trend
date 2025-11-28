import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './notice.entity';
import { NoticeAttachment } from './notice-attachment.entity';
import { NoticeCategory } from './notice-category.entity';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notice, NoticeAttachment, NoticeCategory])],
    controllers: [NoticeController],
    providers: [NoticeService],
})

export class NoticeModule {}