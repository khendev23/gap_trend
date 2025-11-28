// src/worship/worship.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { WorshipImage } from './worship-image.entity';

@Entity('worship')
@Index('idx_worship_date', ['worshipDate'])
export class Worship {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'worship_id',
    })
    worshipId: number;

    @Column({
        name: 'title',
        type: 'varchar',
        length: 255,
    })
    title: string;

    @Column({
        name: 'preacher',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    preacher?: string | null;

    @Column({
        name: 'bible_text',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    bibleText?: string | null;

    @Column({
        name: 'youtube_url',
        type: 'varchar',
        length: 500,
    })
    youtubeUrl: string;

    @Column({
        name: 'worship_date',
        type: 'date',
    })
    worshipDate: string | Date;

    @Column({
        name: 'worship_type',
        type: 'varchar',
        length: 50,
    })
    worshipType: string;

    @Column({
        name: 'is_public',
        type: 'tinyint',
        width: 1,
        default: () => 1,
    })
    isPublic: boolean;

    @Column({
        name: 'description',
        type: 'text',
        nullable: true,
    })
    description?: string | null;

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
    @OneToMany(() => WorshipImage, (image) => image.worship)
    images: WorshipImage[];
}
