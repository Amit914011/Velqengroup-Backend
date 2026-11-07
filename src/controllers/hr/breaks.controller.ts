import { Request, Response } from 'express';
import { EmployeeBreaksModel } from '../../models/employee_breaks.js';
import { AttendanceModel } from '../../models/attendance.js';
import { sendPbError } from '../../views/error.view.js';
import { canManageBreaks, isTeamMember, sendBreakNotification } from '../../services/hr/breaks.service.js';

export async function approveBreak(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageBreaks(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { breakId, status, adminNote } = req.body || {};
  if (!breakId) return sendPbError(res, 400, 'breakId is required.');
  if (status !== 'Approved' && status !== 'Rejected') {
    return sendPbError(res, 400, 'status must be Approved or Rejected.');
  }

  const brk = await EmployeeBreaksModel.findById(breakId);
  if (!brk) return sendPbError(res, 404, 'Break request not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!(await isTeamMember(auth._id, brk.employee || '', isAdmin))) {
    return sendPbError(res, 403, 'This break request is not from your team.');
  }

  brk.status = status;
  brk.adminNote = `${adminNote || ''} — ${status} by ${auth.name || 'Manager'}`;
  await brk.save();
  res.json({ success: true, break: brk.toObject() });
}

export async function warnBreak(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageBreaks(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { breakId, message, source } = req.body || {};
  if (!breakId) return sendPbError(res, 400, 'breakId is required.');

  let empId = '';
  let breakType = 'break';
  let requested = 0;

  if (source === 'attendance') {
    const att = await AttendanceModel.findById(breakId).lean();
    if (!att) return sendPbError(res, 404, 'Break record not found.');
    empId = att.employee || '';
    breakType = 'Lunch';
    requested = 30;
  } else {
    const br = await EmployeeBreaksModel.findById(breakId).lean();
    if (!br) return sendPbError(res, 404, 'Break record not found.');
    empId = br.employee || '';
    breakType = br.breakType || 'break';
    requested = br.requestedMinutes || 0;
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!(await isTeamMember(auth._id, empId, isAdmin))) {
    return sendPbError(res, 403, 'This employee is not on your team.');
  }

  const managerName = auth.name || auth.email || 'Your manager';
  const msg = message || `Your ${breakType} has exceeded the allowed ${requested} minutes. Please return to work immediately.`;
  await sendBreakNotification({
    recipient: empId,
    title: `Break warning from ${managerName}`,
    message: msg,
    senderName: managerName,
    meta: { kind: 'break-warning', breakType },
  });

  res.json({ success: true, sentTo: empId });
}

export async function endBreak(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageBreaks(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { breakId, source } = req.body || {};
  if (!breakId) return sendPbError(res, 400, 'breakId is required.');
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const managerName = auth.name || auth.email || 'Manager';

  if (source === 'attendance') {
    const att = await AttendanceModel.findById(breakId);
    if (!att) return sendPbError(res, 404, 'Break record not found.');
    if (!(await isTeamMember(auth._id, att.employee || '', isAdmin))) {
      return sendPbError(res, 403, 'This employee is not on your team.');
    }
    if (!att.lunchStartAt || att.lunchEndAt) {
      return res.json({ success: true, alreadyEnded: true, id: att._id }) as any;
    }
    const startMs = new Date(att.lunchStartAt).getTime() || Date.now();
    const sessionMin = Math.max(0, (Date.now() - startMs) / 60000);
    const totalUsed = (att.lunchUsedMinutes || 0) + sessionMin;
    att.lunchEndAt = new Date().toISOString();
    att.lunchMinutes = Math.round(sessionMin);
    att.lunchUsedMinutes = totalUsed;
    att.lunchExceeded = totalUsed > 30;
    await att.save();
    return res.json({ success: true, id: att._id }) as any;
  }

  const br = await EmployeeBreaksModel.findById(breakId);
  if (!br) return sendPbError(res, 404, 'Break record not found.');
  if (!(await isTeamMember(auth._id, br.employee || '', isAdmin))) {
    return sendPbError(res, 403, 'This employee is not on your team.');
  }
  if (br.status !== 'Active' && br.status !== 'Exceeded') {
    return res.json({ success: true, alreadyEnded: true, id: br._id }) as any;
  }

  const sMs = br.startAt ? new Date(br.startAt).getTime() : Date.now();
  const allowed = br.requestedMinutes || 3;
  const exactMin = Math.max(0, (Date.now() - sMs) / 60000);
  const mins = Math.max(0, Math.round(exactMin));
  const over = exactMin > allowed;

  br.endAt = new Date().toISOString();
  br.actualMinutes = mins;
  br.status = over ? 'Exceeded' : 'Completed';
  if (over && br.breakType === 'Misc') br.loginLocked = true;
  await br.save();

  await sendBreakNotification({
    recipient: br.employee || '',
    title: `${br.breakType || 'Break'} ended by ${managerName}`,
    message: `${managerName} ended your break. Please resume work immediately.`,
    senderName: managerName,
  });

  res.json({ success: true, id: br._id });
}

export async function unlockMiscBreakLogin(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageBreaks(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { breakId, employeeId, note } = req.body || {};
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const managerName = auth.name || auth.email || 'Manager';
  const nowIso = new Date().toISOString();

  const filter: any = breakId ? { _id: breakId } : { employee: employeeId, breakType: 'Misc' };
  const records = await EmployeeBreaksModel.find(filter);
  if (records.length === 0) return sendPbError(res, 404, 'Break record not found.');

  const unlocked: string[] = [];
  for (const br of records) {
    if (!(await isTeamMember(auth._id, br.employee || '', isAdmin))) {
      return sendPbError(res, 403, 'This employee is not on your team.');
    }
    if (br.status === 'Active') {
      br.endAt = nowIso;
      br.status = 'Completed';
    }
    br.loginLocked = false;
    br.unlockedAt = nowIso;
    br.unlockedBy = auth._id;
    br.unlockedByName = managerName;
    br.unlockNote = note || 'Manager granted login permission after misc break overage.';
    await br.save();
    unlocked.push(br._id);

    await sendBreakNotification({
      recipient: br.employee || '',
      title: 'Misc break login unlocked',
      message: `${managerName} granted permission for you to sign in again after a misc break overage.`,
      senderName: managerName,
    });
  }

  res.json({ success: true, unlocked });
}

