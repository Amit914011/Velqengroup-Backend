import { Request, Response } from 'express';
import { EodReportsModel } from '../../models/eod_reports.js';
import { ManagerCompiledEodsModel } from '../../models/manager_compiled_eods.js';
import { UsersModel } from '../../models/users.js';
import { sendPbError } from '../../views/error.view.js';
import { canManageEod, formatEodEntry, notifyAdminsOfCompiledEod } from '../../services/hr/eod.service.js';

export async function reviewEod(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageEod(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { eodId, reviewStatus, adminRemark, rejectionReason } = req.body || {};
  if (!eodId) return sendPbError(res, 400, 'eodId is required.');
  if (!['Pending', 'Approved', 'Rejected', 'Completed'].includes(reviewStatus)) {
    return sendPbError(res, 400, 'Invalid review status.');
  }

  const eod = await EodReportsModel.findById(eodId);
  if (!eod) return sendPbError(res, 404, 'EOD report not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin) {
    const emp = await UsersModel.findById(eod.employee).lean();
    if (!emp || emp.manager !== auth._id) return sendPbError(res, 403, 'This EOD report is not from your team.');
  }

  const role = isAdmin ? 'Admin' : 'Manager';
  eod.reviewStatus = reviewStatus;
  eod.adminRemark = adminRemark || '';
  eod.rejectionReason = rejectionReason || '';
  eod.reviewedByName = auth.name || auth.email || role;
  eod.reviewedByRole = role;
  eod.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await eod.save();

  res.json({ success: true, reviewStatus });
}

export async function deleteEod(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageEod(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { eodId } = req.body || {};
  if (!eodId) return sendPbError(res, 400, 'eodId is required.');

  const eod = await EodReportsModel.findById(eodId);
  if (!eod) return sendPbError(res, 404, 'EOD report not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin) {
    const emp = await UsersModel.findById(eod.employee).lean();
    if (!emp || emp.manager !== auth._id) return sendPbError(res, 403, 'This EOD report is not from your team.');
  }

  await EodReportsModel.findByIdAndDelete(eodId);
  res.json({ success: true });
}

export async function compileEod(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageEod(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { fromDate, toDate, memberIds } = req.body || {};
  if (!fromDate || !toDate || fromDate > toDate) {
    return sendPbError(res, 400, 'Valid date range (fromDate <= toDate) is required.');
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const teamQuery: any = { role: 'employee' };
  if (!isAdmin) teamQuery.manager = auth._id;
  const team = await UsersModel.find(teamQuery).lean();

  let targetIds = team.map((u) => u._id);
  if (Array.isArray(memberIds) && memberIds.length > 0) {
    targetIds = targetIds.filter((id) => memberIds.includes(id));
  }
  if (targetIds.length === 0) return sendPbError(res, 400, 'No team members selected.');

  const rawEntries = await EodReportsModel.find({
    employee: { $in: targetIds },
    date: { $gte: fromDate, $lte: toDate },
  }).sort({ date: -1 }).lean();

  const entries = rawEntries.map((r) => formatEodEntry(r));
  const teamMembers = team.filter((u) => targetIds.includes(u._id)).map((u) => ({
    id: u._id,
    name: u.name || u.email,
    entryCount: entries.filter((e) => e.employee === u._id).length,
  }));

  const managerName = auth.name || auth.email || 'Manager';
  const title = `Team EOD Report (${fromDate} to ${toDate})`;
  const summary = `${entries.length} entries across ${teamMembers.length} member(s)`;

  const doc = await ManagerCompiledEodsModel.create({
    manager: auth._id,
    managerName,
    managerDepartment: auth.department || '',
    title,
    fromDate,
    toDate,
    teamMembers,
    entries,
    totalEntries: entries.length,
    status: 'Draft',
    compiledAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    summary,
  });

  res.json({ success: true, id: doc._id, ...doc.toObject() });
}

export async function sendCompiledEod(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageEod(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { reportId } = req.body || {};
  if (!reportId) return sendPbError(res, 400, 'reportId is required.');

  const rec = await ManagerCompiledEodsModel.findById(reportId);
  if (!rec) return sendPbError(res, 404, 'Compiled report not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && rec.manager !== auth._id) {
    return sendPbError(res, 403, 'You can only send your own compiled reports.');
  }

  rec.status = 'Sent';
  rec.sentAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await rec.save();

  await notifyAdminsOfCompiledEod({
    reportId: rec._id,
    managerName: rec.managerName || auth.name || 'Manager',
    fromDate: rec.fromDate || '',
    toDate: rec.toDate || '',
    totalEntries: rec.totalEntries || 0,
    memberCount: Array.isArray(rec.teamMembers) ? rec.teamMembers.length : 0,
  });

  res.json({ success: true, status: 'Sent' });
}

export async function getCompiledEods(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const filter = isAdmin ? {} : { manager: auth._id };
  const list = await ManagerCompiledEodsModel.find(filter).sort({ created: -1 }).lean();
  res.json({ success: true, reports: list });
}

export async function getCompiledEodById(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const rec = await ManagerCompiledEodsModel.findById(req.params.id).lean();
  if (!rec) return sendPbError(res, 404, 'Compiled report not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && rec.manager !== auth._id) {
    return sendPbError(res, 403, 'Access denied.');
  }

  res.json({ success: true, report: rec });
}

