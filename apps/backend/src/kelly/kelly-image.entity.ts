import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity('kelly_image')
export class KellyImage {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'image_id',
    })
    imageId: number;

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
        length: 500
    })
    filePath: string;

    @Column({
        name: 'file_extension',
        type: 'varchar',
        length: 10
    })
    fileExtension: string;

    @Column({
        name: 'content_type',
        type: 'varchar',
        length: 100
    })
    contentType: string;

    @Column({
        name: 'file_size',
        type: 'bigint'
    })
    fileSize: number;

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
}