import { Request, Response } from 'express';
import { UsersModel } from '../models/users.js';
import { ChatAccessLogModel } from '../models/chat_access_log.js';
import { sendPbError } from '../views/error.view.js';
import { generatePbId } from '../utils/idGenerator.js';

const EXIT_STATUSES = new Set(['Left', 'Resigned', 'Terminated', 'Exited', 'Inactive', 'Archived', 'Deleted']);

function isEligible(u: any): boolean {
  if (!u) return false;
  const role = u.role || '';
  const dept = u.department || '';
  if (role === 'client' || role === 'ca') return false;
  if (dept === 'D Staff' || dept === 'Chartered Accountant') return false;
  if (EXIT_STATUSES.has(u.employeeStatus || '')) return false;
  return true;
}

function serializeChatUser(u: any): any {
  return {
    id: String(u._id || u.id || ''),
    name: u.name || u.email || '',
    email: u.email || '',
    role: u.role || '',
    department: u.department || '',
    designation: u.designation || '',
    phone: u.phone || '',
    manager: u.manager || '',
    managerName: u.managerName || '',
  };
}

export async function getChatPeople(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const seen = new Set<string>();
  const out: any[] = [];
  const push = (u: any) => {
    const id = String(u?._id || u?.id || '');
    if (!id || seen.has(id) || !isEligible(u)) return;
    seen.add(id);
    out.push(serializeChatUser(u));
  };

  const self = await UsersModel.findById(auth.id || auth._id).lean();
  if (self && isEligible(self)) push(self);

  const isAdmin = auth.role === 'admin' || auth.collectionName === '_superusers';

  if (isAdmin) {
    const staff = await UsersModel.find({ role: { $ne: 'client' }, deleted: { $ne: true } })
      .sort({ name: 1 })
      .limit(2000)
      .lean();
    for (const u of staff) push(u);
  } else {
    const team = await UsersModel.find({ role: 'employee', manager: auth.id, deleted: { $ne: true } })
      .sort({ name: 1 })
      .limit(500)
      .lean();
    for (const u of team) push(u);

    const myManager = self?.manager || auth.manager;
    if (myManager) {
      const mgr = await UsersModel.findById(myManager).lean();
      if (mgr) push(mgr);
      const mates = await UsersModel.find({ role: 'employee', manager: myManager, deleted: { $ne: true } })
        .sort({ name: 1 })
        .limit(500)
        .lean();
      for (const u of mates) push(u);
    }

    const admins = await UsersModel.find({ role: 'admin', deleted: { $ne: true } })
      .sort({ name: 1 })
      .limit(200)
      .lean();
    for (const u of admins) push(u);
  }

  out.sort((a, b) => {
    const aAdmin = a.role === 'admin' ? 0 : 1;
    const bAdmin = b.role === 'admin' ? 0 : 1;
    if (aAdmin !== bAdmin) return aAdmin - bAdmin;
    return (a.name || '').localeCompare(b.name || '');
  });

  res.json({ people: out });
}

export async function recordAdminAccessLog(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) {
    return sendPbError(res, 403, 'Admin access only.');
  }

  const { conversationId, conversationLabel, isDm } = req.body || {};
  if (!conversationId) return sendPbError(res, 400, 'conversationId is required.');

  await ChatAccessLogModel.create({
    _id: generatePbId(),
    admin: auth.id || auth._id,
    adminName: auth.name || auth.email || '',
    conversationId: String(conversationId).slice(0, 120),
    conversationLabel: String(conversationLabel || '').slice(0, 200),
    isDm: Boolean(isDm),
    accessedAt: new Date().toISOString(),
  });

  res.json({ ok: true });
}
