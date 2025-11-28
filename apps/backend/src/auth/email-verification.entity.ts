// src/auth/email-verification.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
} from 'typeorm';

@Entity('email_verification')
@Index('idx_email_verification_email', ['email'])
@Index('idx_email_verification_expires', ['expiresAt'])
export class EmailVerification {
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'email',
        type: 'varchar',
        length: 255,
        unique: true,
    })
    email: string;

    @Column({
        name: 'code_hash',
        type: 'varchar',
        length: 255,
    })
    codeHash: string;

    @Column({
        name: 'expires_at',
        type: 'timestamp',
        precision: 3,
    })
    expiresAt: Date;

    @CreateDateColumn({
        name: 'requested_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    requestedAt: Date;

    @Column({
        name: 'verified_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    verifiedAt?: Date | null;

    @Column({
        name: 'try_count',
        type: 'int',
        default: () => 0,
    })
    tryCount: number;
}
