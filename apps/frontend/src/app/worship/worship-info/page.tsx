// app/worship-guide/page.tsx
"use client";

import { useRouter } from "next/navigation";

type Entry = {
    title: string;
    when: string;
    where: string;
    desc: string;
};

export default function WorshipGuidePage() {
    const router = useRouter();

    const sunday: Entry[] = [
        {
            title: "1부 주일학교 교사예배",
            when: "주일 오전 09:00",
            where: "소예배실(2층)",
            desc: "주로 주일학교를 섬기는 교사들이 먼저 나와서 드립니다.",
        },
        {
            title: "2부 주일예배",
            when: "주일 오전 10:40",
            where: "본당(1층)",
            desc: "사도적 정통 복음을 선포하며 믿음고백으로 화답하는 예배",
        },
        {
            title: "주일 오후예배",
            when: "주일 오후 3:00",
            where: "본당(1층)",
            desc: "정통과 이단을 분별케 하는 주제별 시리즈 설교",
        },
    ];

    const weekday: Entry[] = [
        {
            title: "수요예배",
            when: "수요일 오후 7:30",
            where: "본당(1층)",
            desc: "에베소서 강해설교",
        },
        {
            title: "금요 기도회",
            when: "금요일 오후 8:30",
            where: "본당(1층)",
            desc: "잠언 말씀의 설교 내용으로 믿음 고백과 다짐과 결단과 간절한 간구와 응답을 구하는 기도회",
        },
    ];

    const groups: Entry[] = [
        {
            title: "라온 학생부예배",
            when: "토요일 오전 09:00",
            where: "소예배실(2층)",
            desc: "인간의 죄성을 억제하는 조치 시리즈 설교",
        },
        {
            title: "우리는 청년예배",
            when: "토요일 오전 11:00",
            where: "본당(1층)",
            desc: "창조에 관한 시리즈 설교",
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
                <div className="mx-auto max-w-xl px-4 py-3 grid grid-cols-3 items-center">
                    <button
                        onClick={() => router.back()}
                        aria-label="뒤로가기"
                        className="justify-self-start rounded-lg p-2 hover:bg-gray-100 active:scale-95 lg:opacity-0 lg:pointer-events-none"
                    >
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-center text-[clamp(1rem,5vw,1.25rem)] font-bold tracking-tight">
                        예배 안내
                    </h1>
                    <div className="justify-self-end" />
                </div>
            </header>

            {/* 본문 */}
            <main className="mx-auto max-w-xl px-6 py-4">
                {/* 주일예배 */}
                <SectionTitle>주일예배</SectionTitle>
                <ul role="list" className="space-y-4 px-5">
                    {sunday.map((e, i) => (
                        <li key={i}>
                            <ItemHeader title={e.title} when={e.when} where={e.where} />
                            {e.desc && (
                                <p className="mt-2 pl-4 text-sm leading-relaxed text-gray-700">
                                    {e.desc}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>

                <Divider />

                {/* 주중예배 */}
                <SectionTitle>주중예배</SectionTitle>
                <ul role="list" className="space-y-4 px-5">
                    {weekday.map((e, i) => (
                        <li key={i}>
                            <ItemHeader title={e.title} when={e.when} where={e.where} />
                            {e.desc && (
                                <p className="mt-2 pl-4 text-sm leading-relaxed text-gray-700">
                                    {e.desc}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>

                <Divider />

                {/* 기관예배 */}
                <SectionTitle>기관예배</SectionTitle>
                <ul role="list" className="space-y-4 px-5">
                    {groups.map((e, i) => (
                        <li key={i}>
                            <ItemHeader title={e.title} when={e.when} where={e.where} />
                            {e.desc && (
                                <p className="mt-2 pl-4 text-sm leading-relaxed text-gray-700">
                                    {e.desc}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="h-8" />
            </main>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="mb-2 mt-5 px-1 text-base font-bold tracking-tight text-gray-900">
            {children}
        </h2>
    );
}

function ItemHeader({
                        title,
                        when,
                        where,
                    }: {
    title: string;
    when: string;
    where: string;
}) {
    return (
        <div className="flex flex-col">
            <p className="text-[15px] font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
            {when}
        </span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="inline-flex items-center gap-1">
          <MapPinIcon className="h-4 w-4" />
                    {where}
        </span>
            </p>
        </div>
    );
}

function Divider() {
    return <div className="my-6 h-px w-full bg-gray-200" />;
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path
                d="M15 18l-6-6 6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
            <path
                d="M12 7v5l3 2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
            <path
                d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2.5" strokeWidth="2" />
        </svg>
    );
}