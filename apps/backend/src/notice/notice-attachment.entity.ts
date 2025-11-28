// src/notice/notice-attachment.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Notice } from './notice.entity';

@Entity('notice_attachments')
@Index('IX_notice_attach_notice', ['noticeId'])
export class NoticeAttachment {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'notice_id',
        type: 'bigint',
    })
    noticeId: number;

    @Column({
        name: 'file_name',
        type: 'varchar',
        length: 255,
    })
    fileName: string;

    @Column({
        name: 'file_url',
        type: 'varchar',
        length: 500,
    })
    fileUrl: string;

    @Column({
        name: 'mime_type',
        type: 'varchar',
        length: 120,
        nullable: true,
    })
    mimeType?: string | null;

    @Column({
        name: 'file_size',
        type: 'int',
        nullable: true,
    })
    fileSize?: number | null;

    @Column({
        name: 'sort_order',
        type: 'int',
        default: () => 0,
    })
    sortOrder: number;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    createdAt: Date;

    @ManyToOne(() => Notice, (notice) => notice.noticeAttachments, {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn({
        name: 'notice_id',
        referencedColumnName: 'id',
    })
    notices: Notice;
}
