// kelly.controller.ts
import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { KellyService } from './kelly.service';
import type { Response } from 'express';

/*
*
*   켈리 컨트롤러
*   2025.10.10
*/
@Controller('api/kelly')
export class KellyController {
  constructor(private readonly kellyService: KellyService) {}

  // 메인 화면 조회시 병렬 조회
  @Get('latest')
  async latest(@Query('limit') limit?: string) {
    const rows = await this.kellyService.getLatest(limit ? Number(limit) : 5);
    // 프론트 친화 DTO
    return rows.map((r) => ({
      id: r.imageId.toString(),
      publicUrl: buildPublicUrl(r.filePath), // 👉 핵심
      alt: `말씀 켈리 이미지`,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  // 켈리 게시판 조회
  @Get('list')
  async list(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 6;
    return this.kellyService.list({ limit: safeLimit, cursor: cursor ?? null });
  }

  // 다운로드 버튼
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    await this.kellyService.streamDownloadById(id, res);
  }
}

// 환경변수에 호스트를 넣어두면 배포/개발 전환이 쉬워집니다.
function buildPublicUrl(filePath: string) {
  const base = process.env.PUBLIC_IMAGE_BASE_URL ?? ''; // 예: https://img.gapchurch.kr
  const clean = (s: string) => s.replace(/\/+$/, '');
  return `${clean(base)}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
}
