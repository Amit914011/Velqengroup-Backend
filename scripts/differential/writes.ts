import { DiffResult } from './types.js';
import { safeFetch } from './http.js';

export const WRITE_COLLECTIONS = [
  'leads',
  'support_tickets',
  'notifications',
  'employee_documents',
  'lead_notes',
];

function buildWritePayload(col: string): Record<string, any> {
  const nonce = Date.now().toString(36);
  if (col === 'leads') {
    return {
      name: `diff_test_${nonce}`,
      owner: 'aa8dbkblmftjkug',
      leadType: 'B2B',
      origin: 'Direct',
      status: 'New',
    };
  }
  if (col === 'support_tickets') {
    return {
      employee: '891o0ta1xrrzy59',
      category: 'Other',
      subject: `diff_test_${nonce}`,
      description: 'Differential test ticket',
      status: 'Open',
    };
  }
  if (col === 'notifications') {
    return {
      recipient: '891o0ta1xrrzy59',
      title: `diff_test_${nonce}`,
      message: 'Differential test notification',
    };
  }
  if (col === 'employee_documents') {
    return {
      employee: '891o0ta1xrrzy59',
      documentName: `diff_test_${nonce}`,
    };
  }
  if (col === 'lead_notes') {
    return {
      lead: 'a73xzs1n36ubk25',
      content: 'Differential write test note',
    };
  }
  return {
    title: `diff_test_${nonce}`,
    name: `diff_test_${nonce}`,
    status: 'open',
  };
}

async function cleanupRecord(
  url: string,
  col: string,
  id: string,
  token: string
): Promise<void> {
  if (!id) return;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = token;
  await safeFetch(`${url}/api/collections/${col}/records/${id}`, {
    method: 'DELETE',
    headers,
  });
}

// Test write operations for one role and collection, followed by cleanup
async function testSingleWrite(
  col: string,
  role: string,
  pbTok: string,
  srvTok: string,
  superPbTok: string,
  superSrvTok: string,
  pbUrl: string,
  srvUrl: string
): Promise<DiffResult> {
  const payload = buildWritePayload(col);
  const pbH: Record<string, string> = { 'Content-Type': 'application/json' };
  const srvH: Record<string, string> = { 'Content-Type': 'application/json' };
  if (pbTok) pbH.Authorization = pbTok;
  if (srvTok) srvH.Authorization = srvTok;

  const createPath = `/api/collections/${col}/records`;
  const [pRes, sRes] = await Promise.all([
    safeFetch(`${pbUrl}${createPath}`, { method: 'POST', headers: pbH, body: JSON.stringify(payload) }),
    safeFetch(`${srvUrl}${createPath}`, { method: 'POST', headers: srvH, body: JSON.stringify(payload) }),
  ]);

  const pId = pRes.data?.id || '';
  const sId = sRes.data?.id || '';

  // Immediate cleanup using superuser credentials
  await Promise.all([
    cleanupRecord(pbUrl, col, pId, superPbTok),
    cleanupRecord(srvUrl, col, sId, superSrvTok),
  ]);

  const statusMatch = pRes.status === sRes.status;
  const secViol = (pRes.status === 400 || pRes.status === 401 || pRes.status === 403) && sRes.status === 200;

  return {
    category: 'WRITE',
    collection: col,
    role,
    operation: 'create',
    pbStatus: pRes.status,
    srvStatus: sRes.status,
    statusMatch,
    dataMatch: statusMatch,
    securityViolation: secViol,
    isTimeout: pRes.timedOut || sRes.timedOut,
  };
}

// Test write mutations across targeted collections and roles
export async function testCollectionWrites(
  col: string,
  roles: string[],
  pbTokens: Map<string, string>,
  srvTokens: Map<string, string>,
  pbUrl: string,
  srvUrl: string
): Promise<DiffResult[]> {
  const results: DiffResult[] = [];
  const superPb = pbTokens.get('superuser') || '';
  const superSrv = srvTokens.get('superuser') || '';

  for (const role of roles) {
    const pbTok = pbTokens.get(role) || '';
    const srvTok = srvTokens.get(role) || '';
    const res = await testSingleWrite(col, role, pbTok, srvTok, superPb, superSrv, pbUrl, srvUrl);
    results.push(res);
  }

  return results;
}
