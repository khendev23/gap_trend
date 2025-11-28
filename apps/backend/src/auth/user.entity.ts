// src/user/user.entity.ts

import {
    Entity,
    Column,
    PrimaryColumn,
    Index,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

import { UserRole, ApprovalStatus } from './user.enums';
import { RefreshToken } from './refresh-token.entity';     // 실제 경로에 맞게 수정
import { UserConsent } from './user-consent.entity';    // 실제 경로에 맞게 수정

@Entity('user')
@Index('idx_user_phone', ['phone'])
export class User {
    // Prisma: userId String @id
    @PrimaryColumn({
        type: 'varchar',
        length: 30,
        name: 'user_id',
    })
    userId: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 255,
    })
    name: string;

    @Column({
        name: 'phone',
        type: 'varchar',
        length: 20,
        unique: true,
    })
    phone: string;

    @Column({
        name: 'email',
        type: 'varchar',
        length: 100,
        nullable: true,
        unique: true,
    })
    email?: string | null;

    @Column({
        name: 'password_hash',
        type: 'varchar',
        length: 255,
    })
    passwordHash: string;

    @Column({
        name: 'password_updated_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    passwordUpdatedAt?: Date | null;

    // enum user_role
    @Column({
        name: 'role',
        type: 'enum',
        enum: UserRole,
        default: UserRole.ROLE_USER,
    })
    role: UserRole;

    // enum approval_status
    @Column({
        name: 'approval_status',
        type: 'enum',
        enum: ApprovalStatus,
        default: ApprovalStatus.PENDING,
    })
    approvalStatus: ApprovalStatus;

    @Column({
        name: 'enabled',
        type: 'tinyint',
        width: 1,
        default: () => 1, // true
    })
    enabled: boolean;

    @Column({
        name: 'last_login_at',
        type: 'timestamp',
        precision: 3,
        nullable: true,
    })
    lastLoginAt?: Date | null;

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

    // Relations ============================

    @OneToMany(() => RefreshToken, (rt) => rt.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => UserConsent, (consent) => consent.user)
    consents: UserConsent[];
}
