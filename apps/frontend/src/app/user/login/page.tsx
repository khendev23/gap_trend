'use client';

import { useState } from 'react';
import Link from "next/link";

export default function LoginPage() {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    // 아이디 30자 이하, 비밀번호 8자 이상 + 특수문자 1개 이상
    const validate = () => {
        const { username, password } = form;
        if (!username.trim()) return '아이디를 입력해 주세요.';
        if (username.length > 30) return '아이디는 30자 이하로 입력해 주세요.';
        const pwRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!pwRegex.test(password)) {
            return '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';
        }
        return '';
    };

    const onSubmit = async (e) => {
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
            // 실제 API 연동 시 예:
            // const res = await fetch('/api/auth/login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(form),
            // });
            // if (!res.ok) throw new Error('로그인 실패');
            await new Promise((r) => setTimeout(r, 500)); // 데모용
            setOk(true);
        } catch (err) {
            setError(err.message || '오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
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
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                아이디
                            </label>
                            <input
                                id="username"
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                autoComplete="username"
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
                                <a href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-700">
                                    비밀번호를 잊으셨나요?
                                </a>
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
        </main>
    );
}
