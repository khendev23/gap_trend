import {Injectable} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {terms_status} from '@prisma/client';

@Injectable()
export class TermsService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * 여러 slug 최신본 동시 조회
     */
    async getLatestBulk(slugs: string[], locale: string) {
        const now = new Date();
        // 최신판 선별을 위해 조건에 맞는 다건을 가져오고 메모리에서 slug별 최적 선택
        const rows = await this.prismaService.terms.findMany({
            where: {
                slug: { in: slugs },
                locale,
                status: terms_status.PUBLISHED,
                // effectiveAt: { lte: now },
            },
            orderBy: [{ slug: 'asc' }, { effectiveAt: 'desc' }, { version: 'desc' }],
        });

        // slug별 첫 번째(가장 최신)만 선택
        const map = new Map<string, typeof rows[number]>();
        for (const r of rows) {
            if (!map.has(r.slug)) map.set(r.slug, r);
        }
        // 누락(slug가 아예 없었던 경우) 체크
        return slugs.map((s) => map.get(s) ?? null);
    }

}