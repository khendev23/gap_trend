import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';
import { KellyImage } from './kelly-image.entity';

@Injectable()
export class KellyService {
    constructor(
        @InjectRepository(KellyImage)
        private readonly kellyRepo: Repository<KellyImage>,
        private readonly http: HttpService,
    ) {}

    // 최신 5개만 조회(메인 화면)
    getLatest(limit = 5) {
        const take = Math.min(Math.max(limit ?? 5, 1), 50);

        return this.kellyRepo.find({
            where: {
                // 소프트 삭제 컬럼 쓰면: deleted: false
                deleted: false,
            },
            order: { imageId: 'DESC' },
            take,
            select: {
                imageId: true,
                storedFilename: true,
                filePath: true,
                contentType: true,
                fileSize: true,
                createdAt: true,
            },
        });
    }

    // 무한 스크롤(켈리 게시판)
    async list(params: { limit: number; cursor?: string | null }) {
        const limit = Math.min(Math.max(params.limit ?? 6, 1), 50);
        const take = limit + 1; // 다음 페이지 유무 판단용
        const useCursor = params.cursor && /^\d+$/.test(params.cursor);

        const where: any = {
            deleted: false, // 소프트 삭제 쓴다면
        };

        // Prisma의 cursor + skip(1)을
        // TypeORM에서는 PK 기준 LessThan으로 대체 (DESC 정렬 기준 "이전 페이지")
        if (useCursor) {
            const cursorId = Number(params.cursor);
            where.imageId = LessThan(cursorId);
        }

        const rows = await this.kellyRepo.find({
            where,
            order: { imageId: 'DESC' },
            take,
            select: {
                imageId: true,
                filePath: true,
                storedFilename: true,
                createdAt: true,
            },
        });

        const hasNext = rows.length > limit;
        const sliced = hasNext ? rows.slice(0, limit) : rows;

        const items = sliced.map((r) => ({
            id: String(r.imageId),
            publicUrl: buildPublicUrl(r.filePath),
            alt: `켈리 작품 ${String(r.imageId)}`,
            createdAt: r.createdAt.toISOString(),
        }));

        const nextCursor = hasNext ? items[items.length - 1].id : null;

        return { items, nextCursor };
    }

    // 이미지 다운로드
    async streamDownloadById(id: string, res: Response): Promise<void> {
        const imageId = Number(id);

        const image = await this.kellyRepo.findOne({
            where: { imageId, deleted: false },
            select: {
                storedFilename: true,
                originalFilename: true,
                filePath: true,
                contentType: true,
            },
        });

        if (!image) {
            res.status(404).send('NOT_FOUND');
            return;
        }

        const fileUrl = buildPublicUrl(image.filePath);
        const response = await firstValueFrom(
            this.http.get(fileUrl, { responseType: 'stream', validateStatus: () => true }),
        );

        if (response.status !== 200) {
            res.status(404).send('NOT_FOUND');
            return;
        }

        const ct =
            response.headers['content-type'] ||
            image.contentType ||
            'application/octet-stream';
        const cl = response.headers['content-length'];
        const filename = encodeURIComponent(
            image.originalFilename ?? image.storedFilename ?? `kelly-${id}`,
        );

        res.set('Content-type', ct);
        if (cl) res.set('Content-Length', String(cl));
        res.set('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);

        response.data.on('error', () => {
            if (!res.headersSent) res.status(502);
            res.end();
        });

        response.data.pipe(res);
    }
}

function buildPublicUrl(filePath: string) {
    const base = process.env.PUBLIC_IMAGE_BASE_URL ?? ''; // 예: https://img.gapchurch.kr
    const trim = (s: string) => s.replace(/\/+$/, '');
    const left = trim(base);
    const right = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${left}${right}`;
}
