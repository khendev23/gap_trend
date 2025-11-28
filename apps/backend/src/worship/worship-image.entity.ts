// src/worship/worship-image.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Worship } from './worship.entity';

@Entity('worship_image')
export class WorshipImage {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'image_id',
    })
    imageId: number;

    @Column({
        name: 'worship_id',
        type: 'bigint',
        nullable: true,
    })
    worshipId?: number | null;

    @Column({
        name: 'original_filename',
        type: 'varchar',
        length: 255,
    })
    originalFilename: string;

    @Column({
        name: 'stored_filename',
        type: 'varchar',
        length: 255,
    })
    storedFilename: string;

    @Column({
        name: 'file_path',
        type: 'varchar',
        length: 500,
    })
    filePath: string;

    @Column({
        name: 'file_extension',
        type: 'varchar',
        length: 10,
    })
    fileExtension: string;

    @Column({
        name: 'content_type',
        type: 'varchar',
        length: 100,
    })
    contentType: string;

    @Column({
        name: 'file_size',
        type: 'bigint',
    })
    fileSize: number;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    createdAt: Date;

    @Column({
        name: 'deleted',
        type: 'tinyint',
        width: 1,
        default: () => 0,
    })
    deleted: boolean;

    @Column({
        name: 'description',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description?: string | null;

    // Relation: Worship (Many-to-One)
    @ManyToOne(() => Worship, (worship) => worship.images, {
        nullable: true,
        onDelete: 'SET NULL',   // Prisma 명시 없어 기본 SET NULL이 자연스러움
    })
    @JoinColumn({
        name: 'worship_id',
        referencedColumnName: 'worshipId',
    })
    worship?: Worship | null;
}
