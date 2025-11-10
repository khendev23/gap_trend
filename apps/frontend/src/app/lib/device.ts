// utils/device.ts (client only)
export function getOrCreateDeviceId(): string {
    const name = 'did';
    const match = document.cookie.match(/(?:^|; )did=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);

    const did = crypto.randomUUID();
    const maxAge = 60 * 60 * 24 * 400; // 400일
    document.cookie = `did=${encodeURIComponent(did)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    return did;
}

export function detectDeviceType(): 'mobile'|'tablet'|'desktop' {
    // 1) Chromium UA-CH
    const uaData = (navigator as any).userAgentData;
    if (uaData?.mobile === true) return 'mobile';

    // 2) 전통 UA
    const ua = navigator.userAgent.toLowerCase();
    const isTablet = /(ipad|tablet|sm-t|tab|lenovo tab|kindle|silk)/i.test(ua);
    const isMobile = /(iphone|ipod|android(?!.*tablet)|windows phone|mobi)/i.test(ua);
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';

    // 3) width fallback
    const w = window.innerWidth;
    if (w <= 768) return 'mobile';
    if (w <= 1024) return 'tablet';
    return 'desktop';
}
