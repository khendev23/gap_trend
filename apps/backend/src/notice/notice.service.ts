import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NoticeService {
    constructor(private readonly prismaService: PrismaService) {}

    // 메인화면. 각 5개씩 조회
    // 1. 카테고리 조회
    private async getCategoryId(slug: string) : Promise<bigint> {
        const categories = await this.prismaService.noticeCategories.findUnique({
          where: { slug },
          select: { id: true },
        });

        if(!categories) {
          throw new NotFoundException('Category not found for slug: ' + slug);
        }

        return categories.id;
    }

    // 2. 각 카테고리별 게시글 조회
    async getLatestPosts(slug: string, take = 5) {
        const categoryId: bigint = await this.getCategoryId(slug);
        if (!categoryId) return [];

        const rows = await this.prismaService.notices.findMany({
            where: {
                categoryId,
                visibility: 'PUBLIC',
                deletedAt: null,
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take,
            select: { id: true, title: true, createdAt: true, categoryId: true },
        });

        // 👇 여기서 프론트 친화적인 형태로 변환
        return rows.map((r) => ({
            id: Number(r.id),                    // BigInt → number or string
            title: r.title,
            createdAt: r.createdAt.toString(), // Date → ISO string
            categoryId: Number(r.categoryId),
        }));
    }


    // 카테고리별 게시글 조회요청하여 리턴
    async getHomeLists() {
        const [notice, news] = await Promise.all([
            this.getLatestPosts('NOTICE', 5),
            this.getLatestPosts('NEWS', 5),
        ]);

        return { notice, news };
    }

    async getNoticePostById(id: bigint) {
        const [post, files] = await this.prismaService.$transaction([
            this.prismaService.notices.findUnique({ where: { id } }),
            this.prismaService.noticeAttachments.findMany({
                where: { noticeId: id },
                orderBy: { id: 'asc' },
            }),
        ]);

        if (!post) throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');

        const attachments = files.map(f => ({
            name: f.fileName,
            url: f.fileUrl,
            size: this.formatBytes((f as any).fileSize ?? 0),
        }));

        return {
            id: post.id.toString(),
            title: post.title ?? '',
            // 🔥 여기! UTC 기준 날짜만 잘라서 내려줌
            date: post.createdAt.toISOString().slice(0, 10), // "2025-11-25"
            author: post.author ?? '',
            content: post.content ?? '',
            attachments,
        };
    }

    private formatBytes(bytes: number): string {
        if (!bytes || bytes < 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const val = bytes / Math.pow(k, i);
        return `${val % 1 === 0 ? val : val.toFixed(1)} ${sizes[i]}`;
    }
}