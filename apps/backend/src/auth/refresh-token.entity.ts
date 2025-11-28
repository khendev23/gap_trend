// src/auth/refresh-token.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity'; // 실제 경로에 맞게 수정

@Entity('refresh_token')
@Index('uq_user_device', ['userId', 'deviceId'], { unique: true })
@Index('idx_user_id', ['userId'])
export class RefreshToken {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'token_id',
    })
    tokenId: number; // bigint를 string으로 받고 싶으면 타입을 string으로 변경

    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 30,
    })
    userId: string;

    @Column({
        name: 'device_id',
        type: 'varchar',
        length: 100,
    })
    deviceId: string;

    @Column({
        name: 'jti',
        type: 'varchar',
        length: 64,
        unique: true,
    })
    jti: string;

    @Column({
        name: 'token_hash',
        type: 'varchar',
        length: 255,
    })
    tokenHash: string;

    @Column({
        name: 'expiry_date',
        type: 'timestamp',
        precision: 3,
    })
    expiryDate: Date;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    createdAt: Date;

    @Column({
        name: 'last_used_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    lastUsedAt?: Date | null;

    @Column({
        name: 'revoked_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    revokedAt?: Date | null;

    // Relation: user (ManyToOne)
    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;
}
