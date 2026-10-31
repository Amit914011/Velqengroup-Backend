export interface FetchResponse {
  status: number;
  data: any;
  timedOut: boolean;
  error?: string;
}

// Safely execute an HTTP request with an enforced 10-second timeout
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<FetchResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = { Connection: 'close', ...(options.headers as any || {}) };
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);

    let data: any = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (_) {
        await res.text().catch(() => {});
      }
    } else {
      await res.text().catch(() => {});
    }

    return { status: res.status, data, timedOut: false };
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    return {
      status: isTimeout ? 408 : 0,
      data: null,
      timedOut: isTimeout,
      error: err.message,
    };
  }
}

// Extract and sort visible field names from record or items array
export function extractFields(data: any): string[] {
  if (!data) return [];
  const sample = Array.isArray(data.items) ? data.items[0] : data;
  if (!sample || typeof sample !== 'object') return [];
  return Object.keys(sample).sort();
}
