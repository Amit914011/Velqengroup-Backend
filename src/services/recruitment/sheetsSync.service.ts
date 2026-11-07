import { SheetConnectionsModel } from '../../models/sheet_connections.js';
import { LeadsModel } from '../../models/leads.js';
import { RecruitmentCandidatesModel } from '../../models/recruitment_candidates.js';
import { UsersModel } from '../../models/users.js';
import { generatePbId } from '../../utils/idGenerator.js';
import { normalizePhone } from './recruitment.service.js';

export async function processSheetsWebhook(body: any) {
  const token = body.token;
  if (!token) throw new Error('token is required');

  const rows = Array.isArray(body.rows) ? body.rows : body.row ? [body.row] : [];
  if (rows.length === 0) throw new Error('no rows provided');

  const connection = await SheetConnectionsModel.findOne({ token });
  if (!connection) throw new Error('unknown or invalid token');

  if (connection.active === false) {
    return { created: 0, skipped: rows.length, reason: 'connection inactive' };
  }

  const purposeNorm = String(connection.purpose || '').trim().toLowerCase();
  const isRecruitment = purposeNorm.includes('recruit') || purposeNorm.includes('hiring');

  if (isRecruitment) {
    return processRecruitmentRows(connection, rows);
  } else {
    return processLeadRows(connection, rows);
  }
}

async function processRecruitmentRows(connection: any, rows: any[]) {
  const colMap = connection.hiringColumnMap || connection.columnMap || {};
  let createdCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const fullName = String(row[colMap.name || colMap.fullName || 'Name'] || row.Name || row.name || '').trim();
    const phone = normalizePhone(row[colMap.phone || 'Phone'] || row.Phone || row.phone);
    if (!fullName || !phone) {
      skippedCount++;
      continue;
    }

    const existing = await RecruitmentCandidatesModel.findOne({ phone }).lean();
    if (existing) {
      skippedCount++;
      continue;
    }

    const mgrId = connection.assignedHiringManager;
    let mgrName = '';
    if (mgrId) {
      const u = await UsersModel.findById(mgrId).lean();
      if (u) mgrName = u.name || u.email || '';
    }

    const candidate = new RecruitmentCandidatesModel({
      _id: generatePbId(),
      fullName,
      phone,
      email: String(row[colMap.email || 'Email'] || row.Email || row.email || '').trim().toLowerCase(),
      positionApplied: connection.position || String(row[colMap.position || 'Position'] || '').trim(),
      department: connection.department || 'HR',
      source: `Google Sheet: ${connection.name}`,
      sheetConnection: connection._id,
      assignedManager: mgrId || null,
      assignedManagerName: mgrName,
      status: 'New',
    });
    await candidate.save();
    createdCount++;
  }

  connection.candidatesCreated = (connection.candidatesCreated || 0) + createdCount;
  connection.updated = new Date();
  await connection.save();

  return { created: createdCount, skipped: skippedCount, purpose: 'recruitment' };
}

async function processLeadRows(connection: any, rows: any[]) {
  const colMap = connection.columnMap || {};
  let createdCount = 0;
  let skippedCount = 0;
  const employees: string[] = Array.isArray(connection.employees) ? connection.employees : [];
  let rotIdx = connection.rotationIndex || 0;

  for (const row of rows) {
    const name = String(row[colMap.name || 'Name'] || row.Name || row.name || '').trim();
    const phone = normalizePhone(row[colMap.phone || 'Phone'] || row.Phone || row.phone);
    if (!name || !phone) {
      skippedCount++;
      continue;
    }

    const existing = await LeadsModel.findOne({ phone, deleted: { $ne: true } }).lean();
    if (existing) {
      skippedCount++;
      continue;
    }

    let ownerId: string | null = null;
    let ownerName = '';
    if (employees.length > 0) {
      ownerId = employees[rotIdx % employees.length];
      rotIdx++;
      const u = await UsersModel.findById(ownerId).lean();
      if (u) ownerName = u.name || u.email || '';
    }

    const lead = new LeadsModel({
      _id: generatePbId(),
      name,
      phone,
      email: String(row[colMap.email || 'Email'] || row.Email || row.email || '').trim().toLowerCase(),
      origin: 'Google Sheet',
      source: connection.name || 'Google Sheet',
      department: connection.department || 'General',
      owner: ownerId,
      ownerName,
      leadStatus: connection.defaultStatus || 'New Lead',
    });
    await lead.save();
    createdCount++;
  }

  connection.rotationIndex = rotIdx;
  connection.leadsCreated = (connection.leadsCreated || 0) + createdCount;
  connection.lastLeadAt = new Date().toISOString();
  connection.updated = new Date();
  await connection.save();

  return { created: createdCount, skipped: skippedCount, purpose: 'leads' };
}

