import fs from 'fs';
import path from 'path';
import { setupAuth, PB_URL, SERVER_URL } from './differential/auth.js';
import { testCollectionReads } from './differential/reads.js';
import { testCollectionWrites, WRITE_COLLECTIONS } from './differential/writes.js';
import { testFrontendQueries, loadFrontendQueries } from './differential/frontendQueries.js';
import { DiffResult } from './differential/types.js';
import { safeFetch } from './differential/http.js';

const REPORT_PATH = path.resolve(process.cwd(), '../migration-docs/differential-report.md');
const BASELINE_PATH = path.resolve(process.cwd(), '../migration-docs/m5-baseline.md');

function initReportFile() {
  const header = `# Differential Test Report (PocketBase vs Express API)\n\n` +
    `**Execution Time**: ${new Date().toISOString()}\n` +
    `**PocketBase Origin**: ${PB_URL}\n` +
    `**Server Origin**: ${SERVER_URL}\n\n` +
    `| Category | Collection | Role | Operation | PB Status | Srv Status | Status Match | Data Match | Security Violation |\n` +
    `|---|---|---|---|---|---|---|---|---|\n`;
  fs.writeFileSync(REPORT_PATH, header, 'utf8');
}

function appendToReport(results: DiffResult[]) {
  const lines = results.map(r =>
    `| ${r.category} | ${r.collection} | ${r.role} | ${r.operation} | ${r.pbStatus} | ${r.srvStatus} | ${r.statusMatch ? 'MATCH' : 'MISMATCH'} | ${r.dataMatch ? 'PASS' : 'DIFF'} | ${r.securityViolation ? 'VIOLATION' : 'OK'} |`
  ).join('\n');
  if (lines) fs.appendFileSync(REPORT_PATH, lines + '\n', 'utf8');
}

async function getCollectionNames(pbSuperToken: string): Promise<string[]> {
  const res = await safeFetch(`${PB_URL}/api/collections?perPage=500`, {
    headers: pbSuperToken ? { Authorization: pbSuperToken } : {},
  });
  if (res.status === 200 && res.data?.items) {
    return res.data.items.map((c: any) => c.name);
  }
  const sRes = await safeFetch(`${SERVER_URL}/api/collections`);
  if (sRes.status === 200 && sRes.data?.counts) {
    return Object.keys(sRes.data.counts);
  }
  return [];
}

async function run() {
  console.log('--- Starting Differential Test Runner ---');
  initReportFile();

  const { pbTokens, srvTokens, activeRoles } = await setupAuth();
  const superPb = pbTokens.get('superuser') || '';
  const collections = await getCollectionNames(superPb);
  console.log(`Loaded ${collections.length} collections for differential analysis.\n`);

  const allResults: DiffResult[] = [];
  const testRoles = ['superuser', 'admin', 'employee', 'ca', 'client', 'reception', 'anonymous']
    .filter(r => activeRoles.includes(r));

  // 1. Read differential across collections
  for (let i = 0; i < collections.length; i++) {
    const col = collections[i];
    const { results, summary } = await testCollectionReads(
      col, testRoles, pbTokens, srvTokens, PB_URL, SERVER_URL
    );
    allResults.push(...results);
    appendToReport(results);
    console.log(`[${i + 1}/${collections.length}] ${col}: listOk=${summary.listOk} viewOk=${summary.viewOk} mismatches=${summary.mismatches} timeouts=${summary.timeouts}`);
  }

  // 2. Write differential on targeted collections
  console.log('\n--- Running Targeted Write Tests ---');
  for (const col of WRITE_COLLECTIONS) {
    const wResults = await testCollectionWrites(
      col, testRoles, pbTokens, srvTokens, PB_URL, SERVER_URL
    );
    allResults.push(...wResults);
    appendToReport(wResults);
    console.log(`[WRITE] ${col}: ${wResults.filter(r => r.statusMatch).length}/${wResults.length} status matches.`);
  }

  // 3. Frontend queries differential
  console.log('\n--- Running Real Frontend Queries Test ---');
  const feQueries = loadFrontendQueries();
  const empPb = pbTokens.get('employee') || '';
  const empSrv = srvTokens.get('employee') || '';
  const feResults = await testFrontendQueries(
    feQueries, 'employee', empPb, empSrv, PB_URL, SERVER_URL
  );
  allResults.push(...feResults);
  appendToReport(feResults);
  console.log(`[FRONTEND] Evaluated ${feResults.length} real frontend queries.`);

  // 4. Summary & Baseline Output
  writeFinalSummary(allResults);
}

function writeFinalSummary(results: DiffResult[]) {
  const total = results.length;
  const statusMatches = results.filter(r => r.statusMatch).length;
  const dataMatches = results.filter(r => r.dataMatch).length;
  const secViolations = results.filter(r => r.securityViolation);

  const baselineContent = `# M5 Baseline Differential Results\n\n` +
    `- **Execution Time**: ${new Date().toISOString()}\n` +
    `- **Total Invocations**: ${total}\n` +
    `- **Status Code Matches**: ${statusMatches} (${((statusMatches / total) * 100).toFixed(1)}%)\n` +
    `- **Full Parity Matches**: ${dataMatches} (${((dataMatches / total) * 100).toFixed(1)}%)\n` +
    `- **Security Violations (Server Allow vs PB Deny)**: ${secViolations.length}\n` +
    `- **Category Breakdown**:\n` +
    `  - READ: ${results.filter(r => r.category === 'READ' && r.statusMatch).length} / ${results.filter(r => r.category === 'READ').length} status matches\n` +
    `  - WRITE: ${results.filter(r => r.category === 'WRITE' && r.statusMatch).length} / ${results.filter(r => r.category === 'WRITE').length} status matches\n` +
    `  - FRONTEND: ${results.filter(r => r.category === 'FRONTEND' && r.statusMatch).length} / ${results.filter(r => r.category === 'FRONTEND').length} status matches\n`;

  fs.writeFileSync(BASELINE_PATH, baselineContent, 'utf8');
  console.log('\n=== Differential Test Complete ===');
  console.log(`Status Matches: ${statusMatches}/${total} | Data Matches: ${dataMatches}/${total} | Security Violations: ${secViolations.length}`);
}

run().catch(err => {
  console.error('Fatal differential runner error:', err);
  process.exit(1);
});
