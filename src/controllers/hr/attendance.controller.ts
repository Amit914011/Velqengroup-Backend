import { Request, Response } from 'express';
import { AttendanceModel } from '../../models/attendance.js';
import { UsersModel } from '../../models/users.js';
import { ManagerLocationLogModel } from '../../models/manager_location_log.js';
import { LateApologiesModel } from '../../models/late_apologies.js';
import { sendPbError } from '../../views/error.view.js';
import { formatRecord } from '../../views/record.view.js';
import { istDateStr, istParts } from '../../services/hr/attendance.service.js';

export async function getTodayAttendance(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Not authenticated');

  const date = istDateStr();
  const row = await AttendanceModel.findOne({ employee: auth._id, date }).sort({ created: -1 }).lean();
  if (!row) return res.json({ record: null }) as any;
  res.json({ record: formatRecord(row, 'attendance') });
}

export async function recordManagerLocation(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'employee') {
    return res.json({ success: true, skipped: true, reason: 'not-a-manager' }) as any;
  }

  const { event, latitude, longitude, accuracy, locationSource, locationNote, module, actionType, referenceId, meta } = req.body || {};
  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasFix = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  const now = new Date();
  const istDate = istDateStr(now);
  const { hh, mm } = istParts(now);
  const hNum = Number(hh);
  const ap = hNum >= 12 ? 'PM' : 'AM';
  const h12 = hNum % 12 || 12;
  const timeStr = `${String(h12).padStart(2, '0')}:${mm} ${ap}`;
  const timestampStr = `${istDate} ${hh}:${mm}:${String(now.getUTCSeconds()).padStart(2, '0')}`;

  const rec = await ManagerLocationLogModel.create({
    manager: auth._id,
    managerName: auth.name || auth.email || '',
    event: String(event || 'session').slice(0, 40),
    date: istDate,
    time: timeStr,
    timestamp: timestampStr,
    latitude: hasFix ? lat : 0,
    longitude: hasFix ? lng : 0,
    accuracy: Number(accuracy) || 0,
    locationSource: hasFix ? (locationSource || 'gps') : (locationSource || 'unavailable'),
    locationNote: String(locationNote || '').slice(0, 500),
    module: String(module || '').slice(0, 60),
    actionType: String(actionType || '').slice(0, 100),
    referenceId: String(referenceId || '').slice(0, 200),
    meta: typeof meta === 'object' ? meta : undefined,
  });

  res.json({ success: true, id: rec._id, captured: hasFix, source: rec.locationSource });
}

export async function getManagerLocations(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  let managerId = String(req.query.manager || '').trim();
  const date = String(req.query.date || '').trim();
  const limit = Math.min(Math.max(1, parseInt(String(req.query.limit || '100'), 10)), 500);

  if (!isAdmin) {
    if (managerId && managerId !== auth._id) {
      return sendPbError(res, 403, 'You can only view your own location history.');
    }
    managerId = auth._id;
  }

  const filter: any = {};
  if (managerId) filter.manager = managerId;
  if (date) filter.date = date;

  const rows = await ManagerLocationLogModel.find(filter).sort({ created: -1 }).limit(limit).lean();
  res.json({ success: true, locations: rows, total: rows.length });
}

export async function getLateApologies(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  let teamIds: string[] = [];
  if (auth.role === 'admin' || auth.isSuperuser) {
    const list = await LateApologiesModel.find().sort({ created: -1 }).limit(500).lean();
    return res.json(list) as any;
  }

  const teamMembers = await UsersModel.find({ manager: auth._id, role: 'employee' }, { _id: 1 }).lean();
  teamIds = teamMembers.map((u) => u._id);
  if (teamIds.length === 0) return res.json([]) as any;

  const rows = await LateApologiesModel.find({ employee: { $in: teamIds } }).sort({ created: -1 }).limit(500).lean();
  res.json(rows);
}

export async function reviewLateApology(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const { apologyId, status, adminRemark } = req.body || {};
  if (!apologyId) return sendPbError(res, 400, 'apologyId is required.');
  if (status !== 'Accepted' && status !== 'Rejected') {
    return sendPbError(res, 400, 'status must be Accepted or Rejected.');
  }

  const apology = await LateApologiesModel.findById(apologyId);
  if (!apology) return sendPbError(res, 404, 'Apology request not found.');

  if (auth.role !== 'admin' && !auth.isSuperuser) {
    const emp = await UsersModel.findById(apology.employee);
    if (!emp || emp.manager !== auth._id) {
      return sendPbError(res, 403, 'This apology is not from your team.');
    }
  }

  apology.status = status;
  apology.adminRemark = adminRemark || '';
  apology.reviewedByName = auth.name || auth.email || 'Manager';
  apology.reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await apology.save();

  if (status === 'Accepted' && apology.employee && apology.date) {
    await AttendanceModel.findOneAndUpdate(
      { employee: apology.employee, date: apology.date },
      { $set: { lateMinutes: 0 } }
    );
  }

  res.json({ success: true });
}
