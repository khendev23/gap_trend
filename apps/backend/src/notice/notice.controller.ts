import {Controller, Get} from "@nestjs/common";
import {NoticeService} from "./notice.service";

@Controller('api/notices')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {}

    @Get('latest')
    async latest() {
        return this.noticeService.getHomeLists();
    }
}