// src/terms/terms.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserConsent } from '../auth/user-consent.entity'; // 실제 경로에 맞게 수정

@Entity('terms')
@Index('uk_terms_slug_locale_version', ['slug', 'locale', 'version'], { unique: true })
@Index('idx_terms_status_effective', ['status', 'effectiveAt'])
export class Terms {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'terms_id',
    })
    termsId: number; // bigint를 string으로 받고 싶으면 타입을 string으로 변경

    @Column({
        name: 'slug',
        type: 'varchar',
        length: 50,
    })
    slug: string; // 'privacy', 'tos' 등

    @Column({
        name: 'version',
        type: 'int',
    })
    version: number;

    @Column({
        name: 'locale',
        type: 'varchar',
        length: 10,
    })
    locale: string; // 'ko-KR' 등

    @Column({
        name: 'title',
        type: 'varchar',
        length: 200,
    })
    title: string;

    @Column({
        name: 'content_md',
        type: 'mediumtext',
        nullable: true,
    })
    contentMd?: string | null;

    @Column({
        name: 'content_html',
        type: 'mediumtext',
        nullable: true,
    })
    contentHtml?: string | null;

    // Prisma enum(terms_status)을 아직 모르므로 일단 string + varchar로 매핑
    // 나중에 enum 값 확정되면 type: 'enum', enum: [...] 로 바꿔도 됨
    @Column({
        name: 'status',
        type: 'varchar',
        length: 50,
    })
    status: string;

    @Column({
        name: 'effective_at',
        type: 'timestamp',
        precision: 3,
    })
    effectiveAt: Date;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
        onUpdate: 'CURRENT_TIMESTAMP(3)',
    })
    updatedAt: Date;

    // Relations
    @OneToMany(() => UserConsent, (consent) => consent.terms)
    consents: UserConsent[];
}
