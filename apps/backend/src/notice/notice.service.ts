import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Notice } from './notice.entity';
import { NoticeCategory } from './notice-category.entity';
import { NoticeAttachment } from './notice-attachment.entity';
import { NoticeVisibility } from './notice.enums';

@Injectable()
export class NoticeService {
    constructor(
        @InjectRepository(Notice)
        private readonly noticeRepo: Repository<Notice>,
        @InjectRepository(NoticeCategory)
        private readonly categoryRepo: Repository<NoticeCategory>,
        @InjectRepository(NoticeAttachment)
        private readonly attachmentRepo: Repository<NoticeAttachment>,
    ) {}

    // 1. 카테고리 조회
    private async getCategoryId(slug: string): Promise<number> {
        const category = await this.categoryRepo.findOne({
            where: { slug },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException('Category not found for slug: ' + slug);
        }

        return category.id;
    }

    // 2. 각 카테고리별 게시글 조회 (메인용 최신 N개)
    async getLatestPosts(slug: string, take = 5) {
        const categoryId = await this.getCategoryId(slug);
        if (!categoryId) return [];

        const rows = await this.noticeRepo.find({
            where: {
                categoryId,
                visibility: NoticeVisibility.PUBLIC,
                deletedAt: IsNull(),
            },
            order: {
                createdAt: 'DESC',
                id: 'DESC',
            },
            take,
            // 성능 아끼고 싶으면 select로 필요한 필드만:
            // select: { id: true, title: true, createdAt: true, categoryId: true },
        });

        return rows.map((r) => ({
            id: Number(r.id),
            title: r.title,
            createdAt: r.createdAt.toString(),
            categoryId: Number(r.categoryId),
        }));
    }

    // 메인 화면: 공지/소식 각 5개씩
    async getHomeLists() {
        const [notice, news] = await Promise.all([
            this.getLatestPosts('NOTICE', 5),
            this.getLatestPosts('NEWS', 5),
        ]);

        return { notice, news };
    }

    // 단건 게시글 + 첨부파일 조회
    async getNoticePostById(id: bigint | number) {
        const numericId = typeof id === 'bigint' ? Number(id) : id;

        // Prisma의 $transaction(read-only 두 개)을
        // 여기선 병렬 조회로 대체
        const [post, files] = await Promise.all([
            this.noticeRepo.findOne({
                where: { id: numericId },
            }),
            this.attachmentRepo.find({
                where: { noticeId: numericId },
                order: { id: 'ASC' },
            }),
        ]);

        if (!post) {
            throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
        }

        const attachments = files.map((f) => ({
            name: f.fileName,
            url: f.fileUrl,
            size: this.formatBytes(f.fileSize ?? 0),
        }));

        return {
            id: post.id.toString(),
            title: post.title ?? '',
            // UTC 기준 날짜 문자열에서 날짜 부분만
            date: post.createdAt.toISOString().slice(0, 10),
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
