'use client'

export default function LoginPage() {
    const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;

    const kakaoLoginUrl =
        `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

    const handleKakaoLogin = () => {
        window.location.href = kakaoLoginUrl;
    };

    return (
        <main
            className="
        min-h-screen w-screen
        flex items-center justify-center
        bg-[#f5f5f5] dark:bg-neutral-900
        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
      "
        >
            <section
                className="
          w-[90vw] max-w-[320px]
          bg-white dark:bg-neutral-800
          rounded-lg shadow-md
          px-6 py-8 text-center
        "
                aria-labelledby="login-title"
            >
                <h2
                    id="login-title"
                    className="mb-5 text-2xl font-semibold text-neutral-900 dark:text-neutral-100"
                >
                    로그인
                </h2>

                <button
                    type="button"
                    onClick={handleKakaoLogin}
                    className="
            w-full
            py-3
            text-base font-bold
            rounded
            bg-[#FEE500] text-black
            hover:bg-[#ffd600]
            active:brightness-95
            focus:outline-none focus:ring-2 focus:ring-black/40
            transition
          "
                    aria-label="카카오로 로그인"
                >
                    카카오로 로그인
                </button>
            </section>
        </main>
    );
}