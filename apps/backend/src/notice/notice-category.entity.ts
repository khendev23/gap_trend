// src/notice/notice-category.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Notice } from './notice.entity';

@Entity('notice_categories')
export class NoticeCategory {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 80,
        unique: true,
    })
    name: string;

    @Column({
        name: 'slug',
        type: 'varchar',
        length: 80,
        unique: true,
    })
    slug: string;

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

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
        onUpdate: 'CURRENT_TIMESTAMP(3)',
    })
    updatedAt: Date;

    @OneToMany(() => Notice, (notice) => notice.noticeCategories)
    notices: Notice[];
}
