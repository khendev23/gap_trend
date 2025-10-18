export class TermsResponseDto {
    termsId: string;
    slug: string;         // 'privacy' | 'tos' 등
    version: number;
    locale: string;       // 'ko-KR'
    title: string;
    contentHtml?: string;
    contentMd?: string;
    status: 'DRAFT' | 'PUBLISHED';
    effectiveAt: Date;
    createdAt: Date;
    updatedAt: Date;
}