import {Controller, Get, Query} from "@nestjs/common";
import {TermsService} from "./terms.service";

@Controller("api/terms")
export class TermsController {
    constructor(private readonly termsService: TermsService) {}

    /**
     * 여러 slug 최신본
     * GET /terms/latest?locale=ko-KR&slugs=privacy,tos
     */
    @Get('latest')
    async getLatestBulk(
        @Query('slugs') slugsCSV: string,
        @Query('locale') locale = 'ko-KR',
    ) {
        const slugs = (slugsCSV ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        const list = await this.termsService.getLatestBulk(slugs, locale);

        // 반환 형식 예시: { slug: doc | null } 맵
        const payload: Record<string, any> = {};
        slugs.forEach((s, i) => (payload[s] = list[i]));
        return payload;
    }

}