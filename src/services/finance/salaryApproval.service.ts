import { ManagerSalaryRequestsModel } from '../../models/manager_salary_requests.js';
import { SalarySlipsModel } from '../../models/salary_slips.js';
import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function submitSalaryRequest(auth: any, data: any): Promise<any> {
  const { employeeId, month, year, slipValues, note } = data || {};
  const emp = await UsersModel.findById(employeeId).lean();
  if (!emp) throw new Error('Employee not found.');

  const doc = await ManagerSalaryRequestsModel.create({
    _id: generatePbId(),
    manager: auth._id || auth.id,
    managerName: auth.name || auth.email || 'Manager',
    employee: employeeId,
    employeeName: emp.name || emp.email || '',
    month: String(month),
    year: String(year),
    department: emp.department || '',
    status: 'Pending',
    slipValues: slipValues || {},
    adminNote: note || '',
  });

  notifyAdmins(
    'New Salary Slip Request',
    `Manager ${auth.name || 'Manager'} submitted salary slip for ${emp.name} (${month} ${year}).`,
    { requestId: doc._id }
  ).catch(() => {});

  return doc.toObject();
}

export async function approveSalaryRequest(auth: any, requestId: string): Promise<any> {
  const reqDoc = await ManagerSalaryRequestsModel.findById(requestId);
  if (!reqDoc) throw new Error('Salary request not found.');
  if (reqDoc.status !== 'Pending') throw new Error('Request is already processed.');

  const slipValues = reqDoc.slipValues || {};
  const slipId = generatePbId();
  const slip = await SalarySlipsModel.create({
    _id: slipId,
    ...slipValues,
    employee: reqDoc.employee,
    month: reqDoc.month,
    year: reqDoc.year,
    status: 'Generated',
  });

  reqDoc.status = 'Approved';
  reqDoc.slip = slip._id;
  reqDoc.reviewedBy = auth._id || auth.id;
  reqDoc.reviewedByName = auth.name || auth.email || 'Admin';
  reqDoc.reviewedAt = new Date().toISOString();
  await reqDoc.save();

  if (reqDoc.manager) {
    sendNotification(reqDoc.manager, 'Salary Request Approved', `Salary request for ${reqDoc.employeeName} has been approved.`);
  }
  if (reqDoc.employee) {
    sendNotification(reqDoc.employee, 'Salary Slip Issued', `Your salary slip for ${reqDoc.month} ${reqDoc.year} is now available.`);
  }

  return { request: reqDoc.toObject(), slip: slip.toObject() };
}

export async function rejectSalaryRequest(auth: any, requestId: string, reason = ''): Promise<void> {
  const reqDoc = await ManagerSalaryRequestsModel.findById(requestId);
  if (!reqDoc) throw new Error('Salary request not found.');
  reqDoc.status = 'Rejected';
  reqDoc.adminNote = reason;
  reqDoc.reviewedBy = auth._id || auth.id;
  reqDoc.reviewedByName = auth.name || auth.email || 'Admin';
  reqDoc.reviewedAt = new Date().toISOString();
  await reqDoc.save();

  if (reqDoc.manager) {
    sendNotification(reqDoc.manager, 'Salary Request Rejected', `Salary request for ${reqDoc.employeeName} was rejected: ${reason || 'No note'}`);
  }
}

export async function requestChanges(auth: any, requestId: string, reason = ''): Promise<void> {
  const reqDoc = await ManagerSalaryRequestsModel.findById(requestId);
  if (!reqDoc) throw new Error('Salary request not found.');
  reqDoc.status = 'Changes Requested';
  reqDoc.adminNote = reason;
  reqDoc.reviewedBy = auth._id || auth.id;
  reqDoc.reviewedByName = auth.name || auth.email || 'Admin';
  reqDoc.reviewedAt = new Date().toISOString();
  await reqDoc.save();

  if (reqDoc.manager) {
    sendNotification(reqDoc.manager, 'Salary Request Changes Needed', `Corrections requested for ${reqDoc.employeeName}: ${reason}`);
  }
}

async function notifyAdmins(title: string, message: string, meta: any = {}) {
  const admins = await UsersModel.find({ role: 'admin' }, { _id: 1 }).lean();
  for (const adm of admins) {
    try {
      await NotificationsModel.create({
        _id: generatePbId(),
        recipient: adm._id,
        title, message, meta, read: false,
      });
    } catch (_) {}
  }
}

async function sendNotification(recipient: string, title: string, message: string) {
  try {
    await NotificationsModel.create({
      _id: generatePbId(),
      recipient, title, message, read: false,
    });
  } catch (_) {}
}

