import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';

@Injectable()
export class KellyService {
  constructor(private readonly prismaService: PrismaService, private readonly http: HttpService) {}

  // 최신 5개만 조회(메인 화면)
  getLatest(limit = 5) {
    return this.prismaService.kellyImage.findMany({
      orderBy: { imageId: 'desc' },
      take: limit,
      select: {
        imageId: true,
        storedFilename: true,
        filePath: true,
        contentType: true,
        fileSize: true,
        createdAt: true,
      }
    })
  }

  // 무한 스크롤(켈리 게시판)
  async list(params: {limit: number; cursor?: string | null}) {
    const limit = Math.min(Math.max(params.limit ?? 6, 1), 50);
    const take = limit + 1; // 다음 페이지 유무 판단용
    const useCursor = params.cursor && /^\d+$/.test(params.cursor);

    const rows = await this.prismaService.kellyImage.findMany({
      where: {
        // 소프트삭제 쓰면: deletedAt: null
      },
      orderBy: { imageId: 'desc' },
      take,
      ...(useCursor
        ? { cursor: { imageId: BigInt(params.cursor!) }, skip: 1 }
        : {}),
      select: {
        imageId: true,
        filePath: true,
        storedFilename: true,
        // description을 쓰면: description: true,
        createdAt: true,
      },

    });

    const hasNext = rows.length > limit;
    const sliced = hasNext ? rows.slice(0, limit) : rows;

    const items = sliced.map((r) => ({
      id: r.imageId.toString(),
      publicUrl: buildPublicUrl(r.filePath),
      alt: `켈리 작품 ${r.imageId.toString()}`,
      createdAt: r.createdAt.toISOString(),
    }));

    const nextCursor = hasNext ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }

  // 이미지 다운로드
  async streamDownloadById(id: string, res: Response) : Promise<void> {
    const image = await this.prismaService.kellyImage.findUnique({
      where: {imageId: BigInt(id)},
      select: {storedFilename: true, originalFilename: true, filePath: true, contentType: true}
    })
    if (!image) {
      res.status(404).send('NOT_FOUND');
      return;
    }

    const fileUrl = buildPublicUrl(image.filePath);
    const response = await firstValueFrom(
      this.http.get(fileUrl, { responseType: 'stream', validateStatus: () => true }),
    );
    if (response.status !== 200){
      res.status(404).send('NOT_FOUND');
      return;
    }

    const ct =
      response.headers['content-type'] ||
      image.contentType ||
      'application/octet-stream';
    const cl = response.headers['content-length'];
    const filename = encodeURIComponent(image.originalFilename ?? image.storedFilename ?? `kelly-${id}`);

    res.set('Content-type', ct);
    if (cl) res.set('Content-Length', String(cl));
    res.set('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);

    // 5) 스트리밍 파이프
    response.data.on('error', () => {
      // 업스트림 오류 시 연결 끊기
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