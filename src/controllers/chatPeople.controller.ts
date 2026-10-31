import { Request, Response } from 'express';
import { UsersModel } from '../models/users.js';
import { sendPbError } from '../views/error.view.js';

const EXIT_STATUSES = new Set(['Left', 'Resigned', 'Terminated', 'Exited', 'Inactive', 'Archived', 'Deleted']);

// Check if a user record is eligible for peer chat
function isEligible(u: any): boolean {
  if (!u) return false;
  const role = u.role || '';
  const dept = u.department || '';
  if (role === 'client' || role === 'ca') return false;
  if (dept === 'D Staff' || dept === 'Chartered Accountant') return false;
  if (EXIT_STATUSES.has(u.employeeStatus || '')) return false;
  return true;
}

// Shape user object for chat client
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

// GET /api/chat/people - Returns chat-eligible peers based on role hierarchy
export async function getChatPeople(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) {
    sendPbError(res, 401, 'Login required.');
    return;
  }

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

