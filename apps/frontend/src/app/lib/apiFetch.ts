// app/lib/apiFetch.ts
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, { ...init, credentials: 'include' });
    if (res.status !== 401) return res;

    const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!r.ok) return res; // refresh 실패 → 원 응답 그대로

    return fetch(input, { ...init, credentials: 'include' }); // 재시도
}
