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
    const categoryId : bigint = await this.getCategoryId(slug);

    if (!categoryId) return [];

    return this.prismaService.notices.findMany({
      where: {
        categoryId,
        visibility : 'PUBLIC',
        deletedAt : null
      },
      orderBy : [{ createdAt : 'desc'}, {id : 'desc'}],
      take,
      select : { id:true, title:true, createdAt:true, categoryId:true}
    });
  }

  // 카테고리별 게시글 조회요청하여 리턴
  async getHomeLists() {
    const [notice, news] = await Promise.all([
      this.getLatestPosts('NOTICE', 5),
      this.getLatestPosts('NEWS', 5),
    ]);

    return { notice, news };
  }
}