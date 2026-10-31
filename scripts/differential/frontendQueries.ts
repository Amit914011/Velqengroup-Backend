import fs from 'fs';
import path from 'path';
import { DiffResult } from './types.js';
import { safeFetch } from './http.js';

export interface FrontendQueryItem {
  col: string;
  filter?: string;
  sort?: string;
}

export function loadFrontendQueries(): FrontendQueryItem[] {
  const jsonPath = path.resolve(process.cwd(), 'scripts/frontend-queries.json');
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (_) {}
  }
  // Representative fallbacks from apps/web-next audit
  return [
    { col: 'leads', sort: '-created' },
    { col: 'payment_receipts', filter: 'deleted != true', sort: '-created' },
    { col: 'users', sort: 'name' },
    { col: 'marketplace_listings', filter: 'status="Pending"' },
    { col: 'employee_breaks', sort: '-created' },
    { col: 'attendance', sort: '-date' },
  ];
}

async function runSingleFrontendQuery(
  q: FrontendQueryItem,
  role: string,
  pbTok: string,
  srvTok: string,
  pbUrl: string,
  srvUrl: string
): Promise<DiffResult> {
  const params = new URLSearchParams({ page: '1', perPage: '5' });
  if (q.filter) params.set('filter', q.filter);
  if (q.sort) params.set('sort', q.sort);

  const queryPath = `/api/collections/${q.col}/records?${params.toString()}`;
  const pbH: Record<string, string> = {};
  if (pbTok) pbH.Authorization = pbTok;
  const srvH: Record<string, string> = {};
  if (srvTok) srvH.Authorization = srvTok;

  const [pRes, sRes] = await Promise.all([
    safeFetch(`${pbUrl}${queryPath}`, { headers: pbH }),
    safeFetch(`${srvUrl}${queryPath}`, { headers: srvH }),
  ]);

  const pTotal = pRes.data?.totalItems ?? 0;
  const sTotal = sRes.data?.totalItems ?? 0;
  const statusMatch = pRes.status === sRes.status;
  const dataMatch = statusMatch && pTotal === sTotal;
  const secViol = (pRes.status === 400 || pRes.status === 401 || pRes.status === 403) && sRes.status === 200;

  return {
    category: 'FRONTEND',
    collection: q.col,
    role,
    operation: `filter: ${q.filter || 'none'}, sort: ${q.sort || 'none'}`,
    pbStatus: pRes.status,
    srvStatus: sRes.status,
    pbTotal: pTotal,
    srvTotal: sTotal,
    statusMatch,
    dataMatch,
    securityViolation: secViol,
    isTimeout: pRes.timedOut || sRes.timedOut,
  };
}

export async function testFrontendQueries(
  queries: FrontendQueryItem[],
  role: string,
  pbTok: string,
  srvTok: string,
  pbUrl: string,
  srvUrl: string
): Promise<DiffResult[]> {
  const results: DiffResult[] = [];
  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const r = await runSingleFrontendQuery(q, role, pbTok, srvTok, pbUrl, srvUrl);
    results.push(r);
    if ((i + 1) % 25 === 0 || i === queries.length - 1) {
      console.log(`[FRONTEND] Checked ${i + 1}/${queries.length} queries.`);
    }
  }
  return results;
}
