// src/notice/notice.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { NoticeAttachment } from './notice-attachment.entity';
import { NoticeCategory } from './notice-category.entity';
import { NoticeVisibility } from './notice.enums';


@Entity('notices')
@Index('IX_notices_category', ['categoryId'])
@Index('IX_notices_deleted', ['deletedAt'])
@Index('IX_notices_visibility', ['visibility'])
export class Notice {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'title',
        type: 'varchar',
        length: 200,
    })
    title: string;

    @Column({
        name: 'content',
        type: 'mediumtext',
        nullable: true,
    })
    content?: string | null;

    @Column({
        name: 'author',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    author?: string | null;

    @Column({
        name: 'category_id',
        type: 'bigint',
    })
    categoryId: number;

    // Prisma: notices_visibility enum → 일단 string으로 매핑
    @Column({
        name: 'visibility',
        type: 'enum',
        enum: NoticeVisibility,
        default: NoticeVisibility.PUBLIC,
    })
    visibility: NoticeVisibility;

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

    @Column({
        name: 'deleted_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    deletedAt?: Date | null;

    // Relations ============================

    @OneToMany(
        () => NoticeAttachment,
        (attachment) => attachment.notices,
    )
    noticeAttachments: NoticeAttachment[];

    @ManyToOne(
        () => NoticeCategory,
        (category) => category.notices,
        { onUpdate: 'RESTRICT' },
    )
    @JoinColumn({
        name: 'category_id',
        referencedColumnName: 'id',
    })
    noticeCategories: NoticeCategory;
}
