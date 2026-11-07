import { LeadsModel } from '../../models/leads.js';
import { UsersModel } from '../../models/users.js';
import { LeadNotesModel } from '../../models/lead_notes.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function bulkStatus(auth: any, leadIds: string[], status: string) {
  const adminName = auth.name || auth.email || 'Admin';
  const now = new Date().toISOString();
  const results: any[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of leadIds) {
    const lead = await LeadsModel.findById(id);
    if (!lead) {
      failed++;
      results.push({ id, ok: false, error: 'not found' });
      continue;
    }
    if (lead.deleted) {
      skipped++;
      results.push({ id, ok: false, skipped: true, error: 'lead is in trash' });
      continue;
    }
    const prev = lead.leadStatus || '';
    if (prev === status) {
      skipped++;
      results.push({ id, ok: true, skipped: true, message: 'already in status' });
      continue;
    }

    lead.leadStatus = status;
    lead.updatedByName = adminName;
    lead.updated = new Date();
    await lead.save();

    const note = new LeadNotesModel({
      _id: generatePbId(),
      lead: id,
      author: auth._id || auth.id,
      authorName: adminName,
      content: `Status changed from ${prev || 'None'} to ${status} (bulk Lead Centre).`,
      kind: 'status',
      created: new Date(now),
    });
    await note.save();

    updated++;
    results.push({ id, ok: true });
  }

  return { success: failed === 0, requested: leadIds.length, updated, skipped, failed, results };
}

export async function bulkDelete(auth: any, leadIds: string[], mode: string, phrase: string) {
  if (mode === 'permanent' && phrase !== `DELETE ${leadIds.length} LEADS`) {
    throw new Error(`Permanent delete requires the confirmation phrase: DELETE ${leadIds.length} LEADS`);
  }

  const adminName = auth.name || auth.email || 'Admin';
  const now = new Date().toISOString();
  const results: any[] = [];
  let removed = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of leadIds) {
    const lead = await LeadsModel.findById(id);
    if (!lead) {
      failed++;
      results.push({ id, ok: false, error: 'not found' });
      continue;
    }
    if (mode === 'trash' && lead.deleted) {
      skipped++;
      results.push({ id, ok: false, skipped: true, error: 'already in trash' });
      continue;
    }

    if (mode === 'trash') {
      lead.deleted = true;
      lead.deletedAt = now;
      lead.deletedByName = adminName;
      lead.updatedByName = adminName;
      await lead.save();
    } else {
      await LeadsModel.deleteOne({ _id: id });
    }
    removed++;
    results.push({ id, ok: true, mode });
  }

  return { success: failed === 0, mode, requested: leadIds.length, removed, skipped, failed, results };
}

export async function bulkAssign(auth: any, leadIds: string[], employeeId: string) {
  const emp = await UsersModel.findById(employeeId).lean();
  if (!emp) throw new Error('Employee not found.');
  if (['Left', 'Resigned', 'Terminated'].includes(emp.employeeStatus || '')) {
    throw new Error(`Cannot assign leads to an exited employee (status: ${emp.employeeStatus}).`);
  }

  const adminName = auth.name || auth.email || 'Admin';
  const empName = emp.name || emp.email || '';
  const results: any[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of leadIds) {
    const lead = await LeadsModel.findById(id);
    if (!lead) {
      failed++;
      results.push({ id, ok: false, error: 'not found' });
      continue;
    }
    if (lead.deleted) {
      skipped++;
      results.push({ id, ok: false, skipped: true, error: 'lead is in trash' });
      continue;
    }
    if (lead.owner === employeeId) {
      skipped++;
      results.push({ id, ok: true, skipped: true, message: 'already assigned' });
      continue;
    }

    lead.owner = employeeId;
    lead.updatedByName = adminName;
    lead.updated = new Date();
    await lead.save();

    const note = new LeadNotesModel({
      _id: generatePbId(),
      lead: id,
      author: auth._id || auth.id,
      authorName: adminName,
      content: `Lead assigned to ${empName} (bulk Lead Centre).`,
      kind: 'status',
    });
    await note.save();

    updated++;
    results.push({ id, ok: true });
  }

  return { success: failed === 0, requested: leadIds.length, updated, skipped, failed, employeeName: empName, results };
}

export async function bulkNote(auth: any, leadIds: string[], content: string) {
  const adminName = auth.name || auth.email || 'Admin';
  const results: any[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of leadIds) {
    const lead = await LeadsModel.findById(id);
    if (!lead) {
      failed++;
      results.push({ id, ok: false, error: 'not found' });
      continue;
    }
    if (lead.deleted) {
      skipped++;
      results.push({ id, ok: false, skipped: true, error: 'lead is in trash' });
      continue;
    }

    const note = new LeadNotesModel({
      _id: generatePbId(),
      lead: id,
      author: auth._id || auth.id,
      authorName: adminName,
      content,
      kind: 'note',
    });
    await note.save();

    updated++;
    results.push({ id, ok: true });
  }

  return { success: failed === 0, requested: leadIds.length, updated, skipped, failed, results };
}

