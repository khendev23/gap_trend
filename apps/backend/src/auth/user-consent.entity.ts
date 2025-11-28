// src/consent/user-consent.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';      // 실제 경로에 맞게 조정
import { Terms } from '../terms/terms.entity';  // 실제 경로에 맞게 조정

@Entity('user_consent')
@Index('uk_user_terms_version', ['userId', 'termsId', 'termsVersion'], { unique: true })
@Index('idx_user_consent_user_date', ['userId', 'consentedAt'])
export class UserConsent {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        name: 'consent_id',
    })
    consentId: number; // bigint → string 으로 받고 싶으면 타입 바꾸기

    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 30,
    })
    userId: string;

    @Column({
        name: 'terms_id',
        type: 'bigint',
    })
    termsId: number;

    @Column({
        name: 'terms_version',
        type: 'int',
    })
    termsVersion: number;

    @Column({
        name: 'content_hash',
        type: 'char',
        length: 64,
        nullable: true,
    })
    contentHash?: string | null;

    @Column({
        name: 'content_snapshot',
        type: 'mediumtext',
        nullable: true,
    })
    contentSnapshot?: string | null;

    @CreateDateColumn({
        name: 'consented_at',
        type: 'timestamp',
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
    })
    consentedAt: Date;

    // ==============================
    // Relations
    // ==============================

    @ManyToOne(() => User, (user) => user.consents, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;

    @ManyToOne(() => Terms, (terms) => terms.consents, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'terms_id', referencedColumnName: 'termsId' })
    terms: Terms;
}
