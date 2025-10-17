'use client';

import { useState, useMemo, ChangeEvent, FormEvent } from 'react';

type FormState = {
    username: string;
    password: string;
    name: string;
    phone: string;
};

type FieldErrors = Partial<Record<keyof FormState | 'global', string>>;
type FieldTouched = Partial<Record<keyof FormState, boolean>>;

const idRegexLive = /^[a-zA-Z0-9]*$/; // 부분 입력 허용
const idRegexFinal = /^[a-zA-Z0-9]+$/; // 제출 시 필수
const pwRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
const nameRegexLive = /^[가-힣]*$/;
const nameRegexFinal = /^[가-힣]+$/;

export default function SignUpPage() {
    const [step, setStep] = useState<'consent' | 'form'>('consent');

    // --- 약관 동의 상태 ---
    const [agreePrivacy, setAgreePrivacy] = useState(false);   // 개인정보 처리방침
    const [agreeTerms, setAgreeTerms] = useState(false);       // 이용약관
    const canProceed = agreePrivacy && agreeTerms;

    // --- 폼 상태 ---
    const [form, setForm] = useState<FormState>({
        username: '',
        password: '',
        name: '',
        phone: '',
    });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<FieldTouched>({});
    const [showPw, setShowPw] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [ok, setOk] = useState(false);

    // ---------- 실시간 필드별 검사기 ----------
    const liveValidate = (draft: FormState): FieldErrors => {
        const e: FieldErrors = {};

        // 아이디
        if (draft.username.length > 30) e.username = '아이디는 30자 이하로 입력해 주세요.';
        else if (!idRegexLive.test(draft.username))
            e.username = '아이디는 영어와 숫자만 사용할 수 있습니다.';

        // 비밀번호
        if (draft.password.length > 0 && !pwRegex.test(draft.password)) {
            e.password = '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';
        }

        // 이름
        if (!nameRegexLive.test(draft.name)) {
            e.name = '이름은 한글만 입력할 수 있습니다.';
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

        if (!data.username.trim()) e.username = '아이디를 입력해 주세요.';
        else if (data.username.length > 30) e.username = '아이디는 30자 이하로 입력해 주세요.';
        else if (!idRegexFinal.test(data.username))
            e.username = '아이디는 영어와 숫자만 사용할 수 있습니다.';

        if (!data.password.trim()) e.password = '비밀번호를 입력해 주세요.';
        else if (!pwRegex.test(data.password))
            e.password = '비밀번호는 8자 이상이며, 특수문자를 최소 1개 포함해야 합니다.';

        if (!data.name.trim()) e.name = '이름을 입력해 주세요.';
        else if (!nameRegexFinal.test(data.name))
            e.name = '이름은 한글만 입력할 수 있습니다.';

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

        setTouched({ username: true, password: true, name: true, phone: true });

        const submitErrors = validateOnSubmit(form);
        if (Object.keys(submitErrors).length > 0) {
            setErrors(submitErrors);
            return;
        }

        try {
            setSubmitting(true);
            // 실제 API 연동 예시:
            // const res = await fetch('/api/auth/signup', {...});
            // if (!res.ok) throw new Error('회원가입 실패');
            await new Promise((r) => setTimeout(r, 500));
            setOk(true);
            setForm({ username: '', password: '', name: '', phone: '' });
            setTouched({});
            setErrors({});
        } catch {
            setErrors({ global: '오류가 발생했습니다.' });
        } finally {
            setSubmitting(false);
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
                                <h2 className="text-lg font-semibold text-slate-800">개인정보 처리방침</h2>
                                <div className="mt-2 h-40 overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm text-slate-600 bg-slate-50">
                                    {/* 실제 약관 내용을 넣으세요 */}
                                    <strong>제1조 (개인정보 처리 목적)</strong><br/>
                                    본 교회(이하 “당교회”)는 회원관리 및 신도 확인을 위해 최소한의 개인정보를 수집합니다. 수집한 개인정보는 다음의 목적을 위해 처리됩니다.<br/>
                                    회원(성도) 본인 확인 및 신원 인증<br/>
                                    예배·행사·안내(문자/전화) 발송 및 참여확인<br/>
                                    교회 관련 공지, 긴급 연락, 봉사·섬김 배치 등 운영 목적<br/>
                                    회원관리 및 문의 응대<br/><br/>

                                    <strong>제2조 (수집하는 개인정보의 항목)</strong><br/>
                                    처리 목적 달성을 위해 수집하는 개인정보는 다음과 같습니다.<br/>
                                    필수항목: 성명(이름), 휴대전화번호<br/>
                                    선택항목(운영에 따라 추가 가능): 이메일, 생년월일(연령 확인 목적), 소속(구역/부서) 등<br/>
                                    ※ 최소한의 정보만 수집하며, 목적 외 사용 시 별도 동의를 받습니다.<br/><br/>

                                    <strong>제3조 (개인정보 수집 방법)</strong><br/>
                                    홈페이지 회원가입 양식, 예배/행사 신청서, 오프라인 서면 등으로 수집합니다.<br/><br/>

                                    <strong>제4조 (개인정보의 처리 및 보유기간)</strong><br/>
                                    개인정보는 회원 탈퇴 또는 수집 목적 달성 시 지체 없이 파기합니다.<br/>
                                    단, 관련 법령에 따라 보존해야 하는 경우에는 해당 기간 동안 보관합니다. (예: 회계 관련 자료 보관 의무 등)<br/>
                                    예시 보관기간 제안(검토용): 회원 정보는 탈퇴 시 즉시 파기하거나, 내부 규정상 ‘탈퇴 후 1년’ 또는 법정 보관기간(예: 5년)까지 보관할 수 있으니 내부 방침에 따라 명확히 기재하십시오.<br/><br/>

                                    <strong>제5조 (개인정보의 제3자 제공)</strong><br/>
                                    원칙적으로 제3자에게 제공하지 않습니다. 다만 아래와 같은 경우에는 예외적으로 제공할 수 있습니다.<br/>
                                    이용자(성도)의 동의가 있는 경우<br/>
                                    법령에 근거한 경우(수사기관의 요청 등)<br/>
                                    서비스 제공을 위한 외부 위탁(문자발송업체 등) — 이 경우 위탁업체 및 위탁업무 범위를 고지하고 계약 체결 후 관리합니다.<br/><br/>

                                    <strong>제6조 (위탁 처리)</strong><br/>
                                    당교회는 서비스 이행을 위해 일부 업무를 외부 전문업체에 위탁할 수 있으며, 위탁 시 안전한 관리·감독을 수행합니다. (예: 문자발송업체, 호스팅 서비스 등)<br/>
                                    위탁사례: 문자(SMS) 발송, 서버 호스팅, 백업 등<br/>
                                    위탁계약 시 개인정보보호 책임, 기술적·관리적 보호조치, 재위탁 금지(또는 허용 시 조건) 등을 명시합니다.<br/><br/>

                                    <strong>제7조 (개인정보의 파기 절차 및 방법)</strong><br/>
                                    파기절차: 목적 달성 후 내부 방침에 따라 즉시 또는 일정 보유기간 경과 후 파기합니다.<br/>
                                    파기방법: 전자적 파일은 복구 불가능한 방법(영구삭제), 출력물은 파쇄 또는 소각합니다.<br/><br/>

                                    <strong>제8조 (정보주체의 권리와 그 행사방법)</strong><br/>
                                    회원(정보주체)은 언제든지 다음 권리를 행사할 수 있습니다.<br/>
                                    개인정보 열람, 정정·삭제, 처리정지(처리정지 요구) 요청<br/>
                                    권리행사는 홈페이지 내 ‘개인정보 관리’ 또는 교회 담당자(연락처로 아래 기재)에 서면·전자우편 등으로 요청하시면 지체 없이 조치합니다.<br/><br/>

                                    <strong>제9조 (개인정보의 안전성 확보조치)</strong><br/>
                                    당교회는 개인정보 보호를 위해 다음과 같은 기술적·관리적 조치를 취하고 있습니다.<br/>
                                    개인정보 접근 제한(관리자 권한 분리)<br/>
                                    서버·데이터베이스 암호화(필요 시) 및 백업 관리<br/>
                                    내부 관리계획 수립 및 직원 교육<br/>
                                    물리적 보안(서버실 접근 통제 등)<br/><br/>

                                    <strong>제10조 (개인정보 보호책임자 및 연락처)</strong><br/>
                                    개인정보 처리에 관한 문의, 불만처리 및 피해구제 등에 대하여 아래 책임자가 답변드립니다.<br/>
                                    책임자: [은혜와평강교회] 개인정보보호책임자<br/>
                                    연락처: 전화: 010-9872-9546 / 이메일: khendev23@gmail.com<br/><br/>

                                    <strong>제11조 (개인정보 처리방침 변경)</strong><br/>
                                    본 방침의 내용은 법령 또는 내부 방침에 따라 변경될 수 있으며, 변경 시 홈페이지 공지 또는 개별 고지합니다.<br/>
                                    시행일: 2025년 12월 21일
                                </div>
                                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300"
                                        checked={agreePrivacy}
                                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                                    />
                                    개인정보 처리방침에 동의합니다.
                                </label>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">이용약관</h2>
                                <div className="mt-2 h-40 overflow-y-auto rounded-xl border border-slate-200 p-4 text-sm text-slate-600 bg-slate-50">
                                    <strong>제1조 (목적)</strong><br/>
                                    본 약관은 [교회명](이하 “당교회”)이 제공하는 온라인 서비스(이하 “서비스”)의 이용과 관련한 제반 사항 및 이용자의 권리·의무·책임사항을 규정함을 목적으로 합니다.<br/><br/>

                                    <strong>제2조 (정의)</strong><br/>
                                    “회원” : 당교회 서비스에 개인정보(이름, 휴대전화번호 등)를 제공하여 회원등록을 한 자.<br/>
                                    “이용자” : 서비스를 이용하는 자.<br/><br/>

                                    <strong>제3조 (약관의 효력 및 변경)</strong><br/>
                                    본 약관은 홈페이지에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.<br/>
                                    약관 변경 시 변경사항 및 시행일을 게시하며, 중요 변경은 개별 통지합니다.<br/><br/>

                                    <strong>제4조 (회원가입)</strong><br/>
                                    가입자는 필수적으로 성명·휴대전화번호 등 최소정보를 제공해야 하며, 당교회는 본인확인 후 회원으로 승인합니다.<br/>
                                    회원은 가입 시 기재한 정보가 진실·정확할 것을 보증하며, 변경이 있을 경우 즉시 수정해야 합니다.<br/><br/>

                                    <strong>제5조 (개인정보 보호)</strong><br/>
                                    회원의 개인정보는 개인정보처리방침에 따릅니다. (별도 링크·게시)<br/><br/>

                                    <strong>제6조 (회원의 의무)</strong><br/>
                                    회원은 계정·비밀번호 등의 관리 책임이 있으며, 제3자에게 양도·대여할 수 없습니다.<br/>
                                    허위 정보 기재, 타인 명의 사용 등 부정행위 발생 시 당교회는 회원 자격 제한·삭제 등 조치를 취할 수 있습니다.<br/><br/>

                                    <strong>제7조 (서비스의 제공 및 변경)</strong><br/>
                                    당교회는 회원에게 안내·게시·행사 정보 제공 등 서비스를 제공합니다.<br/>
                                    시스템 점검·운영상의 사유로 서비스 제공을 중단하거나 내용 일부를 변경할 수 있으며, 사전 공지합니다.<br/><br/>

                                    <strong>제8조 (서비스 이용의 제한 및 회원탈퇴)</strong><br/>
                                    당교회는 회원이 본 약관 또는 관련 법령을 위반한 경우 서비스 이용 제한·정지·탈퇴 조치를 할 수 있습니다.<br/>
                                    회원은 언제든지 탈퇴를 요청할 수 있으며, 탈퇴 시 개인정보는 개인정보처리방침에 따라 파기됩니다.<br/><br/>

                                    <strong>제9조 (면책조항)</strong><br/>
                                    천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 당교회는 책임을 지지 않습니다.<br/>
                                    회원이 제공한 연락처 오류 등으로 인한 불이익은 당교회가 책임지지 않습니다(단, 당교회의 중대한 과실이 있을 경우 제외).<br/><br/>

                                    <strong>제10조 (분쟁해결)</strong><br/>
                                    서비스 이용과 관련하여 분쟁이 발생한 경우 당교회와 회원은 상호 협의하여 해결하며, 협의가 이루어지지 않을 경우 관할법원에 따릅니다.<br/><br/>

                                    <strong>부칙</strong><br/>
                                    시행일: 2025년 12월 21일
                                </div>
                                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
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
                                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                                        아이디
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        value={form.username}
                                        onChange={onChange}
                                        onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                                        placeholder="영문+숫자, 30자 이하"
                                        className={inputClass(Boolean(mergedErrors.username))}
                                    />
                                    {mergedErrors.username && (
                                        <p className="mt-1 text-xs text-red-600">{mergedErrors.username}</p>
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

                                {ok && <p className="text-sm text-emerald-600">회원가입이 완료되었습니다.</p>}
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
                                        disabled={submitting}
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
                    © {new Date().getFullYear()} Your Company
                </div>
            </section>
        </main>
    );
}
