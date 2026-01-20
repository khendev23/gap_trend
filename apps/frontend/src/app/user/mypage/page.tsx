import { redirect } from "next/navigation";
import MyPageClient from "./MyPageClient"; // 아까 만든 UI 컴포넌트
import {cookies, headers} from "next/headers";

export default async function MyPage() {
    const cookieStore = await cookies();
    const headersList = await headers(); // 헤더 읽기 준비

    // 1. 쿠키에서 토큰 찾기 (일반적인 경우)
    let token = cookieStore.get('access_token')?.value;

    // 2. 쿠키에 없으면? 미들웨어가 헤더에 넣어줬는지 확인 (재발급 직후 상황)
    if (!token) {
        const authHeader = headersList.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7); // "Bearer " 제거하고 토큰만 추출
            console.log("✅ [MyPage] 미들웨어가 전달한 토큰 사용");
        }
    }

    // 3. 둘 다 없으면 진짜 로그아웃 상태
    if (!token) {
        redirect('/user/login');
    }

    // 3. 확보된 토큰으로 프로필 데이터 요청
    const API_BASE_URL = process.env.backend_url || 'http://localhost:8080';

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`❌ [MyPage] 프로필 조회 실패: ${res.status}`);
            // 토큰은 있었는데 API가 거부하면(예: 위조된 토큰) 로그인으로
            redirect('/user/login');
        }

        const userData = await res.json();

        // 4. 성공! UI 컴포넌트 렌더링
        return <MyPageClient user={userData} />;

    } catch (error) {
        // redirect()는 에러를 던지는 방식으로 작동하므로 catch에서 다시 던져줘야 함
        if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error(error);
        return (
            <div className="p-8 text-center text-gray-500">
                <p>데이터를 불러오는데 실패했습니다.</p>
                <p className="text-sm mt-2">잠시 후 다시 시도해주세요.</p>
            </div>
        );
    }
}