import { DiffResult, CollectionSummary } from './types.js';
import { safeFetch, extractFields } from './http.js';

interface RoleTestParam {
  role: string;
  pbHeader: Record<string, string>;
  srvHeader: Record<string, string>;
}

// Compare field sets between PocketBase and server responses
function areFieldsEqual(pbData: any, srvData: any): boolean {
  const pbFields = extractFields(pbData);
  const srvFields = extractFields(srvData);
  if (pbFields.length === 0 && srvFields.length === 0) return true;
  return pbFields.length === srvFields.length && pbFields.every((f, i) => f === srvFields[i]);
}

// Execute differential check for one role against a collection
async function checkRoleReads(
  colName: string,
  param: RoleTestParam,
  pbUrl: string,
  srvUrl: string
): Promise<DiffResult[]> {
  const results: DiffResult[] = [];
  const sortParam = colName === 'marketplace_users' ? 'name' : '-created';
  const listPath = `/api/collections/${colName}/records?page=1&perPage=5&sort=${sortParam}`;

  // 1. List check
  const [pList, sList] = await Promise.all([
    safeFetch(`${pbUrl}${listPath}`, { headers: param.pbHeader }),
    safeFetch(`${srvUrl}${listPath}`, { headers: param.srvHeader }),
  ]);

  const pTotal = pList.data?.totalItems ?? 0;
  const sTotal = sList.data?.totalItems ?? 0;
  const pIds = (pList.data?.items || []).map((x: any) => String(x.id));
  const sIds = (sList.data?.items || []).map((x: any) => String(x.id));

  const listStatusMatch = pList.status === sList.status;
  const listIdsMatch = pIds.length === sIds.length && pIds.every((id: string, idx: number) => id === sIds[idx]);
  const listFieldsMatch = areFieldsEqual(pList.data, sList.data);
  const listDataMatch = listStatusMatch && pTotal === sTotal && listIdsMatch && listFieldsMatch;
  const listSecViol = (pList.status === 400 || pList.status === 401 || pList.status === 403) && sList.status === 200;

  results.push({
    category: 'READ',
    collection: colName,
    role: param.role,
    operation: 'list',
    pbStatus: pList.status,
    srvStatus: sList.status,
    pbTotal: pTotal,
    srvTotal: sTotal,
    statusMatch: listStatusMatch,
    dataMatch: listDataMatch,
    securityViolation: listSecViol,
    isTimeout: pList.timedOut || sList.timedOut,
  });

  // 2. View check (first record if available)
  if (pList.status === 200 && pIds.length > 0) {
    const recId = pIds[0];
    const viewPath = `/api/collections/${colName}/records/${recId}`;

    const [pView, sView] = await Promise.all([
      safeFetch(`${pbUrl}${viewPath}`, { headers: param.pbHeader }),
      safeFetch(`${srvUrl}${viewPath}`, { headers: param.srvHeader }),
    ]);

    const viewStatusMatch = pView.status === sView.status;
    const viewFieldsMatch = areFieldsEqual(pView.data, sView.data);
    const viewSecViol = (pView.status === 400 || pView.status === 401 || pView.status === 403) && sView.status === 200;

    results.push({
      category: 'READ',
      collection: colName,
      role: param.role,
      operation: 'view',
      pbStatus: pView.status,
      srvStatus: sView.status,
      statusMatch: viewStatusMatch,
      dataMatch: viewStatusMatch && viewFieldsMatch,
      securityViolation: viewSecViol,
      isTimeout: pView.timedOut || sView.timedOut,
    });
  }

  return results;
}

// Test list and view reads for a single collection with at most 3 requests in parallel
export async function testCollectionReads(
  colName: string,
  roles: string[],
  pbTokens: Map<string, string>,
  srvTokens: Map<string, string>,
  pbUrl: string,
  srvUrl: string
): Promise<{ results: DiffResult[]; summary: CollectionSummary }> {
  let timeoutCount = 0;
  const allResults: DiffResult[] = [];

  const roleParams: RoleTestParam[] = roles.map((role) => {
    const pbTok = pbTokens.get(role);
    const srvTok = srvTokens.get(role);
    const pbHeader: Record<string, string> = {};
    if (pbTok) pbHeader.Authorization = pbTok;
    const srvHeader: Record<string, string> = {};
    if (srvTok) srvHeader.Authorization = srvTok;
    return {
      role,
      pbHeader,
      srvHeader,
    };
  });

  // Process in small batches of 3 to bound concurrency
  for (let i = 0; i < roleParams.length; i += 3) {
    if (timeoutCount >= 2) {
      console.warn(`[READ] Skipping remaining roles for ${colName} after 2 timeouts.`);
      break;
    }

    const batch = roleParams.slice(i, i + 3);
    const batchOutputs = await Promise.all(
      batch.map((p) => checkRoleReads(colName, p, pbUrl, srvUrl))
    );

    for (const group of batchOutputs) {
      for (const res of group) {
        allResults.push(res);
        if (res.isTimeout) timeoutCount++;
      }
    }
  }

  const listOk = allResults.filter((r) => r.operation === 'list' && r.statusMatch).length;
  const viewOk = allResults.filter((r) => r.operation === 'view' && r.statusMatch).length;
  const mismatches = allResults.filter((r) => !r.statusMatch).length;
  const securityViolations = allResults.filter((r) => r.securityViolation).length;

  return {
    results: allResults,
    summary: {
      name: colName,
      listOk,
      viewOk,
      mismatches,
      securityViolations,
      timeouts: timeoutCount,
    },
  };
}
