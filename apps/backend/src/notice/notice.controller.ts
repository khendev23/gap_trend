import { Controller, Get, Param } from '@nestjs/common';
import {NoticeService} from "./notice.service";

@Controller('api/notices')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {}

    @Get('latest')
    async latest() {
        return this.noticeService.getHomeLists();
    }

    @Get('getNoticePost/:id')
    async getNoticePost(@Param('id') id: bigint) {
        return this.noticeService.getNoticePostById(id);
    }
}