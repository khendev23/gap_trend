'use client'

import Link from "next/link";

type HeaderMenuProps = {
    closeAction: () => void;
};

export default function HeaderMenu({closeAction} : HeaderMenuProps) {
    return (
        <>
            {/* 배경 어두운 오버레이 */}
            <div onClick={closeAction} />

            {/* 사이드 메뉴 */}
            <div>
                <button onClick={closeAction}>
                    &times;
                </button>
                <div>
                    <h3>복음</h3>
                    <ul>
                        <li><Link href="/gospel/theology" onClick={closeAction}>정통신학</Link></li>
                        <li><Link href="/gospel/life" onClick={closeAction}>신앙의삶</Link></li>
                        <li><Link href="/gospel/confession" onClick={closeAction}>신앙고백</Link></li>
                    </ul>
                </div>
                <div>
                    <h3>예배</h3>
                    <ul>
                        <li><Link href="/worship" onClick={closeAction}>예배</Link></li>
                        <li><Link href="/worship/worship-info" onClick={closeAction}>예배 안내</Link></li>
                    </ul>
                </div>
                <div>
                    <h3>교회</h3>
                    <ul>
                        <li><Link href="/church/church-info" onClick={closeAction}>교회소개</Link></li>
                        <li><Link href="/church/pastor" onClick={closeAction}>목사님 소개</Link></li>
                        <li><Link href="/church/vision" onClick={closeAction}>목회비전</Link></li>
                        <li><Link href="/church/leaders" onClick={closeAction}>섬기는이</Link></li>
                        <li><Link href="/church/location" onClick={closeAction}>오시는길</Link></li>
                        <li><Link href="/church/annual-events" onClick={closeAction}>연간행사</Link></li>
                    </ul>
                </div>
                <div>
                    <h3>사역</h3>
                    <ul>
                        <li><Link href="/ministry/heresy-counseling" onClick={closeAction}>이단</Link></li>
                        <li><Link href="/ministry/discipleship" onClick={closeAction}>양육</Link></li>
                        <li><Link href="/ministry/counsel" onClick={closeAction}>상담</Link></li>
                    </ul>
                </div>
                <div>
                    <h3>다음 세대</h3>
                    <ul>
                        <li><Link href="/groups/weare" onClick={closeAction}>우리는청년</Link></li>
                        <li><Link href="/groups/laon" onClick={closeAction}>라온학생부</Link></li>
                        <li><Link href="/groups/kids" onClick={closeAction}>주일학교</Link></li>
                    </ul>
                </div>
                <div>
                    <h3>목장/기관</h3>
                    <ul>
                        <li><Link href="/groups/love" onClick={closeAction}>사랑목장</Link></li>
                        <li><Link href="/groups/green" onClick={closeAction}>푸른목장</Link></li>
                        <li><Link href="/groups/ok" onClick={closeAction}>OK목장</Link></li>
                        <li><Link href="/groups/peace" onClick={closeAction}>평강목장</Link></li>
                        <li><Link href="/groups/onyu" onClick={closeAction}>온유목장</Link></li>
                        <li><Link href="/groups/grace" onClick={closeAction}>은혜목장</Link></li>
                        <li><Link href="/groups/rest" onClick={closeAction}>쉴만한목장</Link></li>
                        <li><Link href="/groups/faith" onClick={closeAction}>믿음목장</Link></li>
                    </ul>
                </div>
            </div>
        </>
    )
}