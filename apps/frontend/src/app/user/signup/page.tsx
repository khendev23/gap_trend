'use client';

import {useState, useMemo, ChangeEvent, FormEvent, useEffect} from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
    userId: string;
    password: string;
    name: string;
    email: string;
    phone: string;
};

type FieldErrors = Partial<Record<keyof FormState | 'global', string>>;
type FieldTouched = Partial<Record<keyof FormState, boolean>>;

const idRegexLive = /^[a-zA-Z0-9]*$/; // 부분 입력 허용
const idRegexFinal = /^[a-zA-Z0-9]+$/; // 제출 시 필수
const pwRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const nameRegexLive = /^[가-힣]*$/;
const nameRegexFinal = /^[가-힣]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailRegexFinal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TermsDoc = {
    id: string;
    slug: string;       // 'privacy' | 'tos'
    version: number;
    locale: string;
    title: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED';
    effectiveAt: string; // ISO
};

export default function SignUpPage() {
    const router = useRouter();
    const [step, setStep] = useState<'consent' | 'form'>('consent');

    // --- 약관 동의 상태 ---
    const [agreePrivacy, setAgreePrivacy] = useState(false);   // 개인정보 처리방침
    const [agreeTerms, setAgreeTerms] = useState(false);       // 이용약관
    const canProceed = agreePrivacy && agreeTerms;

    // --- 폼 상태 ---
    const [form, setForm] = useState<FormState>({
        userId: '',
        password: '',
        name: '',
        email: '',
        phone: '',
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<FieldTouched>({});
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [ok, setOk] = useState(false);
    const [redirectIn, setRedirectIn] = useState<number | null>(null);

    const [emailSending, setEmailSending] = useState(false);
    const [emailSentMsg, setEmailSentMsg] = useState<string | null>(null);

    const [emailVerifyRequested, setEmailVerifyRequested] = useState(false);    // 인증번호 입력칸 노출 여부
    const [emailCode, setEmailCode] = useState('');                             // 사용자가 입력한 인증번호
    const [emailVerifying, setEmailVerifying] = useState(false);                // 인증번호 확인 중 로딩
    const [emailVerified, setEmailVerified] = useState(false);                  // 이메일 인증 완료 여부
    const [emailVerifyMsg, setEmailVerifyMsg] = useState<string | null>(null);  // 인증 결과 메시지
    const [emailExpireIn, setEmailExpireIn] = useState<number | null>(null);

    const [privacy, setPrivacy] = useState<TermsDoc | null>(null);
    const [tos, setTos] = useState<TermsDoc | null>(null);
    const [loadingTerms, setLoadingTerms] = useState(false);
    const [termsError, setTermsError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoadingTerms(true);
            setTermsError(null);
            try {
                const res = await fetch(
                    '/server-api/terms/latest?slugs=privacy,tos&locale=ko-KR',
                    { cache: 'no-store' } // 항상 최신본
                );
                if (!res.ok) throw new Error('약관을 불러오지 못했습니다.');
                const data = await res.json() as Record<'privacy' | 'tos', TermsDoc | null>;

                setPrivacy(data.privacy ?? null);
                setTos(data.tos ?? null);
            } catch (err: any) {
                setTermsError(err?.message ?? '약관 호출 중 오류가 발생했습니다.');
            } finally {
                setLoadingTerms(false);
            }
        };
        load();
    }, [])

    // ⬅️ SignUpPage 내부
    useEffect(() => {
        if (!ok) return;

        setRedirectIn(5);

        const timer = setInterval(() => {
            setRedirectIn((prev) => (prev == null ? null : Math.max(prev - 1, 0)));
        }, 1000);

        return () => clearInterval(timer);
    }, [ok]);

    useEffect(() => {
        if (!ok) return;
        if (redirectIn === 0) {
            router.push('/user/login');
        }
    }, [ok, redirectIn, router]);


    useEffect(() => {
        // 인증 요청 안 했거나, 이미 인증 끝났으면 타이머 안 돌림
        if (!emailVerifyRequested || emailVerified) return;
        if (emailExpireIn === null) return;
        if (emailExpireIn <= 0) return;

        const timer = setInterval(() => {
            setEmailExpireIn((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    return 0; // 0에서 멈춤
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [emailVerifyRequested, emailVerified, emailExpireIn]);

    // ---------- 실시간 필드별 검사기 ----------
    const liveValidate = (draft: FormState): FieldErrors => {
        const e: FieldErrors = {};

        // 아이디
        if (draft.userId.length > 30) e.userId = '아이디는 30자 이하로 입력해 주세요.';
        else if (!idRegexLive.test(draft.userId))
            e.userId = '아이디는 영어와 숫자만 사용할 수 있습니다.';

        // 비밀번호
        if (draft.password.length > 0 && !pwRegex.test(draft.password)) {
            e.password = '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';
        }

        // 이름
        if (!nameRegexLive.test(draft.name)) {
            e.name = '이름은 한글만 입력할 수 있습니다.';
        }

        // 이메일
        if (!emailRegex.test(draft.email)) {
            e.email = '유효한 이메일 형식이 아닙니다.';
        }

        // 휴대폰
        const digits = draft.phone.replace(/\D/g, '');
        if (digits.length > 0 && !(digits.length === 10 || digits.length === 11)) {
            e.phone = '휴대폰 번호는 숫자 10~11자리여야 합니다.';
        }

        return e;
    };

    const displayErrors = useMemo(() => {
        const e = liveValidate(form);
        const filtered: FieldErrors = {};
        (Object.keys(e) as (keyof FormState)[]).forEach((k) => {
            if (touched[k]) filtered[k] = e[k];
        });
        return filtered;
    }, [form, touched]);

    // ---------- 제출 시 전체 검사 ----------
    const validateOnSubmit = (data: FormState): FieldErrors => {
        const e: FieldErrors = {};

        if (!data.userId.trim()) e.userId = '아이디를 입력해 주세요.';
        else if (data.userId.length > 30) e.userId = '아이디는 30자 이하로 입력해 주세요.';
        else if (!idRegexFinal.test(data.userId))
            e.userId = '아이디는 영어와 숫자만 사용할 수 있습니다.';

        if (!data.password.trim()) e.password = '비밀번호를 입력해 주세요.';
        else if (!pwRegex.test(data.password))
            e.password = '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';

        if (!data.name.trim()) e.name = '이름을 입력해 주세요.';
        else if (!nameRegexFinal.test(data.name))
            e.name = '이름은 한글만 입력할 수 있습니다.';

        if (!data.email.trim()) e.email = '이메일을 입력해 주세요.';
        else if (!emailRegexFinal.test(data.email))
            e.email = '유효한 이메일 형식이 아닙니다.';

        const digits = data.phone.replace(/\D/g, '');
        if (!digits) e.phone = '휴대폰 번호를 입력해 주세요.';
        else if (!(digits.length === 10 || digits.length === 11))
            e.phone = '휴대폰 번호를 정확히 입력해 주세요.';

        return e;
    };

    // ---------- 이벤트 핸들러 ----------
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digits = value.replace(/\D/g, '').slice(0, 11);
            let formatted = digits;
            if (digits.length > 3 && digits.length <= 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
            } else if (digits.length > 7) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
            }
            const draft = { ...form, phone: formatted };
            setForm(draft);
            setTouched((t) => ({ ...t, phone: true }));
            return;
        }

        // ✅ 이메일이 바뀌면 인증 상태 초기화
        if (name === 'email') {
            setEmailVerified(false);
            setEmailVerifyRequested(false);
            setEmailCode('');
            setEmailSentMsg(null);
            setEmailVerifyMsg(null);
            setEmailExpireIn(null);
        }

        const draft = { ...form, [name]: value };
        setForm(draft);
        setTouched((t) => ({ ...t, [name]: true }));
    };

    const onBlur = (name: keyof FormState) => {
        setTouched((t) => ({ ...t, [name]: true }));
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOk(false);

        setTouched({ userId: true, password: true, name: true, phone: true });

        const submitErrors = validateOnSubmit(form);
        if (Object.keys(submitErrors).length > 0) {
            setErrors(submitErrors);
            return;
        }

        try {
            setSubmitting(true);
            // 실제 API 연동
            const res = await fetch(
                '/server-api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: form.userId,      // 로그인 아이디(문자열 PK)
                    name: form.name,
                    phone: form.phone,          // "010-1234-5678" 형태 허용 (서버에서 숫자만 저장)
                    password: form.password,
                    email: form.email,           // 있으면 전송
                    consents: [
                        { termsId: String(privacy?.id) }, // 개인정보 처리방침
                        { termsId: String(tos?.id) },     // 이용약관
                    ],
                    userAgent: navigator.userAgent,
                }),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json(); // { ok: true, userId: '...' }
            await new Promise((r) => setTimeout(r, 500));
            setOk(true);
            setForm({ userId: '', password: '', name: '', email: '', phone: '' });
            setTouched({});
            setErrors({});
        } catch {
            setErrors({ global: '오류가 발생했습니다.' });
        } finally {
            setSubmitting(false);
        }
    };

    const onClickSendEmailVerify = async () => {
        if (!form.email.trim()) {
            setTouched((t) => ({ ...t, email: true }));
            setErrors((prev) => ({
                ...prev,
                email: '이메일을 입력해 주세요.',
            }));
            return;
        }

        if (!emailRegexFinal.test(form.email)) {
            setTouched((t) => ({ ...t, email: true }));
            setErrors((prev) => ({
                ...prev,
                email: '유효한 이메일 형식이 아닙니다.',
            }));
            return;
        }

        setEmailSentMsg(null);
        setEmailVerifyMsg(null);
        setEmailVerified(false);
        setEmailVerifyRequested(false);
        setEmailCode('');

        try {
            setEmailSending(true);
            const res = await fetch('/server-api/auth/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '인증 메일 전송에 실패했습니다.');
            }

            setEmailSentMsg('인증 메일을 전송했습니다. 메일함을 확인해 주세요.');
            setEmailVerifyRequested(true); // ✅ 인증번호 입력칸 노출
            setEmailExpireIn(180);
        } catch (err: any) {
            setEmailSentMsg(
                '인증 메일 전송 중 오류가 발생했습니다.'
            );
        } finally {
            setEmailSending(false);
        }
    };

    const onClickConfirmEmailCode = async () => {
        if (!emailVerifyRequested) return;

        // ✅ 프론트에서 3분 만료 체크
        if (emailExpireIn !== null && emailExpireIn <= 0) {
            setEmailVerifyMsg('인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.');
            setEmailVerified(false);
            return;
        }

        if (!emailCode.trim()) {
            setEmailVerifyMsg('인증번호를 입력해 주세요.');
            setEmailVerified(false);
            return;
        }

        try {
            setEmailVerifying(true);
            setEmailVerifyMsg(null);

            const res = await fetch('/server-api/auth/email/verify/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    code: emailCode,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '인증번호가 일치하지 않습니다.');
            }

            setEmailVerified(true);
            setEmailVerifyMsg('이메일 인증이 완료되었습니다.');
        } catch (err: any) {
            setEmailVerified(false);
            setEmailVerifyMsg(
                err?.message || '인증번호가 일치하지 않습니다.'
            );
        } finally {
            setEmailVerifying(false);
        }
    };

    const mergedErrors: FieldErrors = { ...displayErrors, ...errors };

    const inputClass = (hasError: boolean) =>
        `mt-1 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            hasError ? 'border-red-500 focus:ring-red-400' : 'border-slate-200 focus:ring-indigo-500'
        }`;

    return (
        <main className="min-h-svh bg-slate-50 flex items-center justify-center p-4">
            <section className="w-full max-w-xl">
                <div className="rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 p-6 md:p-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-800 text-center">
                        회원가입
                    </h1>

                    {/* STEP 1: 약관 동의 */}
                    {step === 'consent' && (
                        <div className="mt-6 space-y-6">
                            <div>
                                {/* 개인정보 처리방침 */}
                                <h2 className="text-lg font-semibold text-slate-800">개인정보 처리방침</h2>
                                <div className="mt-2 h-40 overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm text-slate-600 bg-slate-50">
                                    {loadingTerms && <p>불러오는 중…</p>}
                                    {termsError && <p className="text-red-600">{termsError}</p>}
                                    {!loadingTerms && !termsError && (
                                        privacy ? (
                                            privacy.content ? (
                                                <div dangerouslySetInnerHTML={{ __html: privacy.content }} />
                                            ) : (
                                                <pre className="whitespace-pre-wrap">{'내용이 없습니다.'}</pre>
                                            )
                                        ) : (
                                            <p>개인정보 처리방침 최신본이 없습니다.</p>
                                        )
                                    )}
                                </div>
                                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300"
                                        checked={agreePrivacy}
                                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                                        disabled={loadingTerms || !!termsError || !privacy}
                                    />
                                    개인정보 처리방침에 동의합니다.
                                </label>
                            </div>

                            <div>
                                {/* 이용약관 */}
                                <h2 className="mt-6 text-lg font-semibold text-slate-800">이용약관</h2>
                                <div className="mt-2 h-40 overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm text-slate-600 bg-slate-50">
                                    {loadingTerms && <p>불러오는 중…</p>}
                                    {termsError && <p className="text-red-600">{termsError}</p>}
                                    {!loadingTerms && !termsError && (
                                        tos ? (
                                            tos.content ? (
                                                <div dangerouslySetInnerHTML={{ __html: tos.content}} />
                                            ) : (
                                                <pre className="whitespace-pre-wrap">{'내용이 없습니다.'}</pre>
                                            )
                                        ) : (
                                            <p>이용약관 최신본이 없습니다.</p>
                                        )
                                    )}
                                </div>
                                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        disabled={loadingTerms || !!termsError || !tos}
                                    />
                                    이용약관에 동의합니다.
                                </label>
                            </div>

                            <button
                                onClick={() => setStep('form')}
                                disabled={!canProceed}
                                className="w-full rounded-2xl bg-indigo-600 py-3 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                다음
                            </button>

                            <p className="text-xs text-slate-500 text-center">
                                계속 진행 시, 서비스 정책에 동의하는 것으로 간주됩니다.
                            </p>
                        </div>
                    )}

                    {/* STEP 2: 회원가입 폼 */}
                    {step === 'form' && (
                        <>
                            <p className="mt-2 text-center text-sm text-slate-500">
                                이미 계정이 있으신가요?{' '}
                                <a href="/user/login" className="font-medium text-indigo-600 hover:underline">
                                    로그인
                                </a>
                            </p>

                            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                                {/* 아이디 */}
                                <div>
                                    <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                                        아이디
                                    </label>
                                    <input
                                        id="userId"
                                        name="userId"
                                        value={form.userId}
                                        onChange={onChange}
                                        onBlur={() => setTouched((t) => ({ ...t, userId: true }))}
                                        placeholder="영문+숫자, 30자 이하"
                                        className={inputClass(Boolean(mergedErrors.userId))}
                                    />
                                    {mergedErrors.userId && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.userId}</p>
                                    )}
                                </div>

                                {/* 비밀번호 */}
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
                                            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                                            placeholder="8자 이상, 특수문자 1개 포함"
                                            className={`${inputClass(Boolean(mergedErrors.password))} pr-12`}
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
                                    {mergedErrors.password && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.password}</p>
                                    )}
                                </div>

                                {/* 이름 */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                        이름
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={onChange}
                                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                        placeholder="한글만 입력"
                                        className={inputClass(Boolean(mergedErrors.name))}
                                    />
                                    {mergedErrors.name && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.name}</p>
                                    )}
                                </div>

                                {/* 이메일 */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                        이메일
                                    </label>

                                    {/* 인풋 + 인증 메일 보내기 버튼 */}
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            id="email"
                                            name="email"
                                            value={form.email}
                                            onChange={onChange}
                                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                            placeholder="example@domain.com"
                                            className={`${inputClass(Boolean(mergedErrors.email))} flex-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={onClickSendEmailVerify}
                                            disabled={
                                                emailSending ||
                                                !form.email.trim() ||
                                                Boolean(mergedErrors.email) ||
                                                emailVerified
                                            }
                                            className="whitespace-nowrap rounded-xl border border-indigo-500 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {emailVerified
                                                ? '인증 완료'
                                                : emailSending
                                                    ? '전송 중…'
                                                    : '인증 메일 보내기'}
                                        </button>
                                    </div>

                                    {mergedErrors.email && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.email}</p>
                                    )}

                                    {emailSentMsg && (
                                        <p className="mt-1 text-xs text-slate-600">{emailSentMsg}</p>
                                    )}

                                    {emailVerifyRequested && !emailVerified && (
                                        <div className="mt-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={emailCode}
                                                    onChange={(e) => setEmailCode(e.target.value)}
                                                    placeholder="인증번호를 입력해 주세요"
                                                    className="flex-1 mt-0 w-full rounded-xl border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 border-slate-200 focus:ring-indigo-500"
                                                    disabled={emailExpireIn !== null && emailExpireIn <= 0}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={onClickConfirmEmailCode}
                                                    disabled={
                                                        emailVerifying ||
                                                        !emailCode.trim() ||
                                                        (emailExpireIn !== null && emailExpireIn <= 0)
                                                    }
                                                    className="whitespace-nowrap rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {emailVerifying ? '확인 중…' : '인증번호 확인'}
                                                </button>
                                            </div>

                                            {/* ✅ 남은 시간 표시 */}
                                            {emailExpireIn !== null && emailExpireIn > 0 && (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    남은 시간:{' '}
                                                    {Math.floor(emailExpireIn / 60)}:
                                                    {String(emailExpireIn % 60).padStart(2, '0')}
                                                </p>
                                            )}

                                            {/* ✅ 만료 안내 */}
                                            {emailExpireIn !== null && emailExpireIn <= 0 && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {emailVerifyMsg && (
                                        <p
                                            className={`mt-1 text-xs ${
                                                emailVerified ? 'text-emerald-600' : 'text-red-600'
                                            }`}
                                        >
                                            {emailVerifyMsg}
                                        </p>
                                    )}
                                </div>

                                {/* 휴대폰 */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                                        휴대폰 번호
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        inputMode="numeric"
                                        value={form.phone}
                                        onChange={onChange}
                                        onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                        placeholder="010-1234-5678"
                                        className={inputClass(Boolean(mergedErrors.phone))}
                                    />
                                    {mergedErrors.phone && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.phone}</p>
                                    )}
                                </div>

                                {ok && (
                                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                                        회원가입이 완료되었습니다.
                                        {typeof redirectIn === 'number' && redirectIn > 0 && (
                                            <> {' '}<b>{redirectIn}</b>초 뒤 로그인 페이지로 이동합니다.</>
                                        )}
                                        {' '}
                                        <button
                                            type="button"
                                            onClick={() => router.push('/user/login')}
                                            className="ml-2 underline hover:no-underline"
                                        >
                                            지금 이동
                                        </button>
                                    </div>
                                )}
                                {mergedErrors.global && (
                                    <p className="text-sm text-red-600">{mergedErrors.global}</p>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep('consent')}
                                        className="w-1/3 rounded-2xl bg-slate-200 py-3 text-slate-800 font-medium hover:bg-slate-300 transition"
                                    >
                                        이전
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || ok || !emailVerified}
                                        className="w-2/3 rounded-2xl bg-indigo-600 py-3 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                                    >
                                        {submitting ? '처리 중…' : '가입하기'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} 은혜와평강교회
                </div>
            </section>
        </main>
    );
}
