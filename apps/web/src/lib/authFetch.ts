'use client'

// Cliente: wrapper de fetch que adjunta Authorization automáticamente y
// refresca tokens ante 401, reintentando una sola vez la solicitud original.

const AUTH_BYPASS_SUBSTRINGS = [
  '/api/auth/refresh',
  '/api/auth/login',
  '/api/auth/logout',
];

function isBypassed(url: string) {
  return AUTH_BYPASS_SUBSTRINGS.some((s) => url.includes(s));
}

function getAccessTokenFromCookies(): string | null {
  if (typeof window === 'undefined') return null;
  // Intentar leer desde cookies visibles (no httpOnly)
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  // Fallback a localStorage (token guardado en login para header Authorization)
  try {
    const ls = window.localStorage?.getItem('access_token');
    return ls || null;
  } catch {
    return null;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        // liberar en el siguiente tick para evitar condiciones de carrera
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      });
  }
  return refreshInFlight;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const urlStr = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;

  // Preparar headers con Authorization si hay access_token en cookies
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!headers.has('Authorization')) {
    const token = getAccessTokenFromCookies();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const firstInit: RequestInit = {
    ...init,
    headers,
    credentials: 'include', // siempre incluir cookies httpOnly
  };

  // Ejecutar primera solicitud
  const firstRes = await fetch(input as any, firstInit);

  // Si no es 401 o es una ruta de auth, devolver tal cual
  if (firstRes.status !== 401 || isBypassed(urlStr)) return firstRes;

  // Si el body es un stream no reintetable, abortar reintento para evitar errores
  const bodyAny = (init as any).body as any;
  if (bodyAny && typeof bodyAny === 'object' && typeof bodyAny.getReader === 'function') {
    return firstRes;
  }

  // Intentar refrescar tokens
  const refreshed = await refreshTokens();
  if (!refreshed) return firstRes;

  // Actualizar Authorization desde cookie y reintentar una vez
  const headers2 = new Headers(firstInit.headers as HeadersInit | undefined);
  const token2 = getAccessTokenFromCookies();
  if (token2) headers2.set('Authorization', `Bearer ${token2}`);
  else headers2.delete('Authorization');

  const secondInit: RequestInit = {
    ...firstInit,
    headers: headers2,
  };

  return fetch(input as any, secondInit);
}
