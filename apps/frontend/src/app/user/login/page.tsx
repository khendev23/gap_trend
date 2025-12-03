'use client';

import {useState} from 'react';
import Link from "next/link";
import { getOrCreateDeviceId, detectDeviceType } from '@/app/lib/device';

export default function LoginPage() {
    const [form, setForm] = useState({
        userId: '',
        password: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);

    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState<'find' | 'verify' | 'reset'>('find');
    const [forgotForm, setForgotForm] = useState({
        userId: '',
        email: '',
        code: '',
        newPassword: '',
    });
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');


    const onChange = (e:any) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    // 아이디 30자 이하, 비밀번호 8자 이상 + 특수문자 1개 이상
    const validate = () => {
        const { userId, password } = form;
        if (!userId.trim()) return '아이디를 입력해 주세요.';
        if (userId.length > 30) return '아이디는 30자 이하로 입력해 주세요.';
        const pwRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!pwRegex.test(password)) {
            return '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';
        }
        return '';
    };

    const onSubmit = async (e:any) => {
        e.preventDefault();
        setError('');
        setOk(false);

        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        try {
            setSubmitting(true);

            const deviceId = getOrCreateDeviceId();
            // const deviceType = detectDeviceType();

            // 실제 API 연동 시 예:
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials : "include",
                body: JSON.stringify({...form, deviceId}),
            });
            if (!res.ok) {
                const m = await res.json().catch(() => ({}));
                throw new Error(m.message ?? '로그인 실패');
            }
            setOk(true);

            // next 파라미터 있으면 그리로, 없으면 홈
            window.location.href = new URLSearchParams(window.location.search).get('next') ?? '/';
        } catch (err:any) {
            setError(err.message || '오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const onChangeForgot = (e: any) => {
        const { name, value } = e.target;
        setForgotForm((f) => ({ ...f, [name]: value }));
    };

    const openForgotModal = () => {
        setForgotOpen(true);
        setForgotStep('find');
        setForgotForm({ userId: '', email: '', code: '', newPassword: '' });
        setForgotError('');
        setForgotMessage('');
    };

    const closeForgotModal = () => {
        setForgotOpen(false);
    };

    const submitFindAccount = async (e: any) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');

        if (!forgotForm.userId.trim() || !forgotForm.email.trim()) {
            setForgotError('아이디와 이메일을 모두 입력해 주세요.');
            return;
        }

        try {
            setForgotSubmitting(true);
            const res = await fetch('/server-api/auth/forgot/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: forgotForm.userId.trim(),
                    email: forgotForm.email.trim(),
                }),
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setForgotError('일치하는 정보가 없습니다.');
                    return;
                }
                const m = await res.json().catch(() => ({}));
                throw new Error(m.message ?? '요청 처리 중 오류가 발생했습니다.');
            }

            setForgotStep('verify');
            setForgotMessage('입력하신 이메일로 인증번호를 발송했습니다. 메일을 확인해 주세요.');
        } catch (err: any) {
            setForgotError(err.message ?? '요청 처리 중 오류가 발생했습니다.');
        } finally {
            setForgotSubmitting(false);
        }
    };

    const submitVerifyCode = async (e: any) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');

        if (!forgotForm.code.trim()) {
            setForgotError('이메일로 받은 인증번호를 입력해 주세요.');
            return;
        }

        try {
            setForgotSubmitting(true);
            const res = await fetch('/server-api/auth/forgot/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: forgotForm.userId.trim(),
                    email: forgotForm.email.trim(),
                    code: forgotForm.code.trim(),
                }),
            });

            if (!res.ok) {
                const m = await res.json().catch(() => ({}));
                throw new Error(m.message ?? '인증에 실패했습니다.');
            }

            setForgotStep('reset');
            setForgotMessage('인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.');
        } catch (err: any) {
            setForgotError(err.message ?? '인증에 실패했습니다.');
        } finally {
            setForgotSubmitting(false);
        }
    };

    const submitResetPassword = async (e: any) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');

        if (!forgotForm.newPassword.trim()) {
            setForgotError('새 비밀번호를 입력해 주세요.');
            return;
        }

        const pwRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!pwRegex.test(forgotForm.newPassword)) {
            setForgotError('비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.');
            return;
        }

        try {
            setForgotSubmitting(true);
            const res = await fetch('/server-api/auth/forgot/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: forgotForm.userId.trim(),
                    email: forgotForm.email.trim(),
                    code: forgotForm.code.trim(),
                    newPassword: forgotForm.newPassword,
                }),
            });

            if (!res.ok) {
                const m = await res.json().catch(() => ({}));
                throw new Error(m.message ?? '비밀번호 변경에 실패했습니다.');
            }

            setForgotMessage('새 비밀번호가 설정되었습니다. 다시 로그인해 주세요.');
        } catch (err: any) {
            setForgotError(err.message ?? '비밀번호 변경에 실패했습니다.');
        } finally {
            setForgotSubmitting(false);
        }
    };


    return (
        <main className="min-h-svh bg-slate-50 flex items-center justify-center p-4">
            <section className="w-full max-w-md">
                <div className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 p-6 md:p-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800 text-center">
                        로그인
                    </h1>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        계정이 없으신가요?{' '}
                        <Link href="/user/signup" className="font-medium text-indigo-600 hover:underline">
                            회원가입
                        </Link>
                    </p>

                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                                아이디
                            </label>
                            <input
                                id="userId"
                                name="userId"
                                value={form.userId}
                                onChange={onChange}
                                autoComplete="userId"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                비밀번호
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={onChange}
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute inset-y-0 right-2 my-auto rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                                    aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                                >
                                    {showPw ? '숨김' : '보기'}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={openForgotModal}
                                    className="text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
                                >
                                    비밀번호를 잊으셨나요?
                                </button>
                            </div>

                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {ok && <p className="text-sm text-emerald-600">로그인 성공!</p>}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-2xl bg-indigo-600 py-3 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {submitting ? '처리 중…' : '로그인'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Your Company
                </div>
            </section>
            {forgotOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                비밀번호 재설정
                            </h2>
                            <button
                                type="button"
                                onClick={closeForgotModal}
                                className="text-sm text-slate-400 hover:text-slate-600"
                            >
                                닫기
                            </button>
                        </div>

                        {/* 1단계: 아이디 + 이메일 입력 */}
                        {forgotStep === 'find' && (
                            <form onSubmit={submitFindAccount} className="space-y-4">
                                <p className="text-sm text-slate-500">
                                    아이디와 이메일을 입력해 주세요. 일치하는 계정이 있는 경우 인증 메일이 발송됩니다.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        아이디
                                    </label>
                                    <input
                                        name="userId"
                                        value={forgotForm.userId}
                                        onChange={onChangeForgot}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        이메일
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={forgotForm.email}
                                        onChange={onChangeForgot}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                {forgotError && (
                                    <p className="text-sm text-red-600">{forgotError}</p>
                                )}
                                {forgotMessage && (
                                    <p className="text-sm text-emerald-600">{forgotMessage}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={forgotSubmitting}
                                    className="w-full rounded-2xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {forgotSubmitting ? '확인 중…' : '인증 메일 보내기'}
                                </button>
                            </form>
                        )}

                        {/* 2단계: 이메일 인증번호 입력 */}
                        {forgotStep === 'verify' && (
                            <form onSubmit={submitVerifyCode} className="space-y-4">
                                <p className="text-sm text-slate-500">
                                    이메일로 전송된 인증번호를 입력해 주세요.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        인증번호
                                    </label>
                                    <input
                                        name="code"
                                        value={forgotForm.code}
                                        onChange={onChangeForgot}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm tracking-[0.3em]"
                                    />
                                </div>
                                {forgotError && (
                                    <p className="text-sm text-red-600">{forgotError}</p>
                                )}
                                {forgotMessage && (
                                    <p className="text-sm text-emerald-600">{forgotMessage}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForgotStep('find');
                                            setForgotError('');
                                            setForgotMessage('');
                                        }}
                                        className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        뒤로
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotSubmitting}
                                        className="flex-1 rounded-2xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        {forgotSubmitting ? '확인 중…' : '인증 확인'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 3단계: 새 비밀번호 입력 */}
                        {forgotStep === 'reset' && (
                            <form onSubmit={submitResetPassword} className="space-y-4">
                                <p className="text-sm text-slate-500">
                                    새로 사용할 비밀번호를 입력해 주세요.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        새 비밀번호
                                    </label>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        value={forgotForm.newPassword}
                                        onChange={onChangeForgot}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                {forgotError && (
                                    <p className="text-sm text-red-600">{forgotError}</p>
                                )}
                                {forgotMessage && (
                                    <p className="text-sm text-emerald-600">{forgotMessage}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={closeForgotModal}
                                        className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotSubmitting}
                                        className="flex-1 rounded-2xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        {forgotSubmitting ? '변경 중…' : '비밀번호 변경'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
