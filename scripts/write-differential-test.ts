import fs from 'fs';
import path from 'path';
import { safeFetch } from './differential/http.js';
import { RoleCred } from './differential/types.js';
import { ROLES } from './differential/auth.js';
import { loadRules } from '../src/utils/rules/ruleLoader.js';

const PB_URL = 'http://127.0.0.1:8092';
const SRV_URL = 'http://127.0.0.1:8091';
const REPORT_PATH = path.resolve(process.cwd(), '../migration-docs/write-differential-report.md');

interface WriteResult {
  col: string; role: string; op: 'create' | 'update' | 'delete';
  pbStatus: number; srvStatus: number; pbAllow: boolean; srvAllow: boolean;
  match: boolean; violation: boolean;
}

async function loginRole(url: string, cred: RoleCred, isServer: boolean): Promise<string> {
  if (cred.role === 'anonymous') return '';
  const password = isServer ? cred.srvPass : cred.pbPass;
  const res = await safeFetch(`${url}/api/collections/${cred.col}/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: cred.email, password }),
  });
  return res.status === 200 && res.data?.token ? res.data.token : '';
}

async function getTokens() {
  const pbTokens = new Map<string, string>();
  const srvTokens = new Map<string, string>();
  for (const c of ROLES) {
    const [p, s] = await Promise.all([loginRole(PB_URL, c, false), loginRole(SRV_URL, c, true)]);
    if (p) pbTokens.set(c.role, p);
    if (s) srvTokens.set(c.role, s);
  }
  return { pbTokens, srvTokens };
}

async function buildDummyPayload(col: string, colSchema: any, suP: string): Promise<Record<string, any>> {
  const nonce = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  try {
    const listRes = await safeFetch(`${PB_URL}/api/collections/${col}/records?perPage=1`, { headers: { Authorization: suP } });
    const sample = listRes.data?.items?.[0];
    if (sample) {
      const p = { ...sample };
      delete p.id; delete p.created; delete p.updated; delete p.collectionId; delete p.collectionName;
      for (const k of Object.keys(p)) {
        if (typeof p[k] === 'string' && p[k] && !['owner', 'employee', 'lead', 'user', 'manager'].includes(k)) {
          if (!p[k].startsWith('http') && p[k].length < 50 && !p[k].includes('@')) p[k] = `__difftest_${nonce}`;
        }
      }
      return p;
    }
  } catch (_) {}
  const payload: Record<string, any> = { name: `__difftest_${nonce}`, title: `__difftest_${nonce}` };
  for (const f of (colSchema?.fields || [])) {
    if (f.system || f.name === 'id' || f.name === 'created' || f.name === 'updated') continue;
    if (f.type === 'text') payload[f.name] = `__difftest_${nonce}`;
    else if (f.type === 'number') payload[f.name] = 1;
    else if (f.type === 'bool') payload[f.name] = true;
    else if (f.type === 'select') payload[f.name] = f.values?.[0] || 'Other';
    else if (f.type === 'relation') payload[f.name] = f.collectionId === '_pb_users_auth_' ? '891o0ta1xrrzy59' : '';
  }
  return payload;
}

async function cleanupRecord(url: string, col: string, id: string, token: string) {
  if (id) await safeFetch(`${url}/api/collections/${col}/records/${id}`, { method: 'DELETE', headers: { Authorization: token } });
}

async function testSingleCreate(col: string, role: string, pTok: string, sTok: string, suP: string, suS: string, body: any): Promise<WriteResult> {
  let [pbId, srvId] = ['', ''];
  const pH: Record<string, string> = { 'Content-Type': 'application/json' };
  const sH: Record<string, string> = { 'Content-Type': 'application/json' };
  if (pTok) pH.Authorization = pTok;
  if (sTok) sH.Authorization = sTok;
  try {
    const [pRes, sRes] = await Promise.all([
      safeFetch(`${PB_URL}/api/collections/${col}/records`, { method: 'POST', headers: pH, body: JSON.stringify(body) }),
      safeFetch(`${SRV_URL}/api/collections/${col}/records`, { method: 'POST', headers: sH, body: JSON.stringify(body) }),
    ]);
    pbId = pRes.data?.id || ''; srvId = sRes.data?.id || '';
    const pbAllow = pRes.status >= 200 && pRes.status < 300;
    const srvAllow = sRes.status >= 200 && sRes.status < 300;
    return { col, role, op: 'create', pbStatus: pRes.status, srvStatus: sRes.status, pbAllow, srvAllow, match: pbAllow === srvAllow, violation: !pbAllow && srvAllow };
  } finally {
    await Promise.all([cleanupRecord(PB_URL, col, pbId, suP), cleanupRecord(SRV_URL, col, srvId, suS)]);
  }
}

async function testSingleUpdate(col: string, role: string, pTok: string, sTok: string, suP: string, suS: string, body: any): Promise<WriteResult> {
  let [pbId, srvId] = ['', ''];
  const suH = { 'Content-Type': 'application/json' };
  const pH: Record<string, string> = { 'Content-Type': 'application/json' };
  const sH: Record<string, string> = { 'Content-Type': 'application/json' };
  if (pTok) pH.Authorization = pTok;
  if (sTok) sH.Authorization = sTok;
  try {
    const [pC, sC] = await Promise.all([
      safeFetch(`${PB_URL}/api/collections/${col}/records`, { method: 'POST', headers: { ...suH, Authorization: suP }, body: JSON.stringify(body) }),
      safeFetch(`${SRV_URL}/api/collections/${col}/records`, { method: 'POST', headers: { ...suH, Authorization: suS }, body: JSON.stringify(body) }),
    ]);
    pbId = pC.data?.id || ''; srvId = sC.data?.id || '';
    if (!pbId && !srvId) return { col, role, op: 'update', pbStatus: pC.status, srvStatus: sC.status, pbAllow: false, srvAllow: false, match: true, violation: false };

    const patchB = { name: `${body.name}_u` };
    const [pRes, sRes] = await Promise.all([
      pbId ? safeFetch(`${PB_URL}/api/collections/${col}/records/${pbId}`, { method: 'PATCH', headers: pH, body: JSON.stringify(patchB) }) : { status: 404 },
      srvId ? safeFetch(`${SRV_URL}/api/collections/${col}/records/${srvId}`, { method: 'PATCH', headers: sH, body: JSON.stringify(patchB) }) : { status: 404 },
    ]);
    const pbAllow = pRes.status >= 200 && pRes.status < 300;
    const srvAllow = sRes.status >= 200 && sRes.status < 300;
    return { col, role, op: 'update', pbStatus: pRes.status, srvStatus: sRes.status, pbAllow, srvAllow, match: pbAllow === srvAllow, violation: !pbAllow && srvAllow };
  } finally {
    await Promise.all([cleanupRecord(PB_URL, col, pbId, suP), cleanupRecord(SRV_URL, col, srvId, suS)]);
  }
}

async function testSingleDelete(col: string, role: string, pTok: string, sTok: string, suP: string, suS: string, body: any): Promise<WriteResult> {
  let [pbId, srvId] = ['', ''];
  const suH = { 'Content-Type': 'application/json' };
  const pH: Record<string, string> = {};
  const sH: Record<string, string> = {};
  if (pTok) pH.Authorization = pTok;
  if (sTok) sH.Authorization = sTok;
  try {
    const [pC, sC] = await Promise.all([
      safeFetch(`${PB_URL}/api/collections/${col}/records`, { method: 'POST', headers: { ...suH, Authorization: suP }, body: JSON.stringify(body) }),
      safeFetch(`${SRV_URL}/api/collections/${col}/records`, { method: 'POST', headers: { ...suH, Authorization: suS }, body: JSON.stringify(body) }),
    ]);
    pbId = pC.data?.id || ''; srvId = sC.data?.id || '';
    if (!pbId && !srvId) return { col, role, op: 'delete', pbStatus: pC.status, srvStatus: sC.status, pbAllow: false, srvAllow: false, match: true, violation: false };

    const [pRes, sRes] = await Promise.all([
      pbId ? safeFetch(`${PB_URL}/api/collections/${col}/records/${pbId}`, { method: 'DELETE', headers: pH }) : { status: 404 },
      srvId ? safeFetch(`${SRV_URL}/api/collections/${col}/records/${srvId}`, { method: 'DELETE', headers: sH }) : { status: 404 },
    ]);
    const pbAllow = pRes.status >= 200 && pRes.status < 300;
    const srvAllow = sRes.status >= 200 && sRes.status < 300;
    return { col, role, op: 'delete', pbStatus: pRes.status, srvStatus: sRes.status, pbAllow, srvAllow, match: pbAllow === srvAllow, violation: !pbAllow && srvAllow };
  } finally {
    await Promise.all([cleanupRecord(PB_URL, col, pbId, suP), cleanupRecord(SRV_URL, col, srvId, suS)]);
  }
}

async function main() {
  const { pbTokens, srvTokens } = await getTokens();
  const suP = pbTokens.get('superuser') || '';
  const suS = srvTokens.get('superuser') || '';
  const rules = loadRules();
  const cols = Object.keys(rules);
  const roles = ROLES.map((r: RoleCred) => r.role);

  fs.writeFileSync(REPORT_PATH, `# All-Collections Write Rules Differential Report\n\n| Collection | Role | Op | PB Status | Srv Status | PB Allow | Srv Allow | Match | Security |\n|---|---|---|---|---|---|---|---|---|\n`);
  let [totalTests, matches, violations] = [0, 0, 0];

  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    const schemaRes = await safeFetch(`${PB_URL}/api/collections/${col}`, { headers: { Authorization: suP } });
    const payload = await buildDummyPayload(col, schemaRes.data, suP);
    let colMatches = 0;

    for (const role of roles) {
      const [pT, sT] = [pbTokens.get(role) || '', srvTokens.get(role) || ''];
      const [c, u, d] = await Promise.all([
        testSingleCreate(col, role, pT, sT, suP, suS, payload),
        testSingleUpdate(col, role, pT, sT, suP, suS, payload),
        testSingleDelete(col, role, pT, sT, suP, suS, payload),
      ]);
      for (const res of [c, u, d]) {
        totalTests++;
        if (res.match) { matches++; colMatches++; }
        if (res.violation) violations++;
        fs.appendFileSync(REPORT_PATH, `| ${res.col} | ${res.role} | ${res.op} | ${res.pbStatus} | ${res.srvStatus} | ${res.pbAllow} | ${res.srvAllow} | ${res.match ? 'MATCH' : 'DIFF'} | ${res.violation ? 'VIOLATION' : 'OK'} |\n`);
      }
    }
    console.log(`[${i + 1}/${cols.length}] ${col}: ${colMatches}/21 matches (violations: ${violations})`);
  }
  console.log(`\n=== Write Test Complete ===\nTotal: ${totalTests} | Matches: ${matches} | Violations: ${violations}`);
}

main().catch(err => { console.error('Write test failed:', err); process.exit(1); });
