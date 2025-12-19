import i18n from '@/i18n';

type HeadersInput = HeadersInit | undefined;

function mergeHeaders(original: HeadersInput, extra: Record<string, string>): HeadersInit {
  if (!original) return extra;
  if (original instanceof Headers) {
    const headers = new Headers(original);
    Object.entries(extra).forEach(([k, v]) => {
      if (!headers.has(k)) headers.set(k, v);
    });
    return headers;
  }
  const obj = Array.isArray(original) ? Object.fromEntries(original) : { ...original };
  Object.entries(extra).forEach(([k, v]) => {
    if (!(k in obj)) obj[k] = v;
  });
  return obj;
}

export function fetchWithLocale(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const locale = i18n.language || navigator?.language || 'en';
  const headers = mergeHeaders(init.headers, { 'Accept-Language': locale });

  return fetch(input, { ...init, headers });
}
