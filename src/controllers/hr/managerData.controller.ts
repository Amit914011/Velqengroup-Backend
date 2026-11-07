import { Request, Response } from 'express';
import { UsersModel } from '../../models/users.js';
import { LeaveRequestsModel } from '../../models/leave_requests.js';
import { EmployeeBreaksModel } from '../../models/employee_breaks.js';
import { EodReportsModel } from '../../models/eod_reports.js';
import { sendPbError } from '../../views/error.view.js';

export async function getManagerData(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isManager = auth.role === 'admin' || auth.isSuperuser || auth.permissions?.manageTeam || auth.designation?.includes('Manager');
  if (!isManager) return sendPbError(res, 403, 'Permission denied.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const teamQuery: any = { role: 'employee' };
  if (!isAdmin) teamQuery.manager = auth._id;

  const teamDocs = await UsersModel.find(teamQuery).lean();
  const teamIds = teamDocs.map((u) => u._id);

  const team = teamDocs.map((u) => ({
    id: u._id,
    name: u.name || u.email || '',
    email: u.email || '',
    phone: u.phone || '',
    employeeId: u.employeeId || '',
    designation: u.designation || '',
    department: u.department || '',
    joiningDate: u.joiningDate || '',
    shiftStart: u.shiftStart || '',
    shiftEnd: u.shiftEnd || '',
    employeeStatus: u.employeeStatus || 'Active',
    lastWorkingDay: u.lastWorkingDay || '',
    resignationDate: u.resignationDate || '',
    managerName: u.managerName || '',
    paidBasic: u.paidBasic || '',
    allowances: u.allowances || '',
    incentives: u.incentives || '',
    aadharNumber: u.aadharNumber || '',
    panNumber: u.panNumber || '',
    hasAadharFile: !!u.aadharFile,
    hasPanFile: !!u.panFile,
    hasBankFile: !!u.bankFile,
  }));

  const pendingLeaves = await LeaveRequestsModel.find({
    employee: { $in: teamIds },
    status: 'Pending',
  }).sort({ created: -1 }).limit(100).lean();

  const pendingBreaks = await EmployeeBreaksModel.find({
    employee: { $in: teamIds },
    status: { $in: ['Pending', 'Active', 'Exceeded'] },
  }).sort({ created: -1 }).limit(100).lean();

  const teamEods = await EodReportsModel.find({
    employee: { $in: teamIds },
  }).sort({ date: -1 }).limit(60).lean();

  res.json({
    team,
    pendingLeaves,
    pendingBreaks,
    teamEods,
    stats: [],
  });
}

