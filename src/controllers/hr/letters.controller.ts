import { Request, Response } from 'express';
import { EmployeeLettersModel } from '../../models/employee_letters.js';
import { UsersModel } from '../../models/users.js';
import { NotificationsModel } from '../../models/notifications.js';
import { sendPbError } from '../../views/error.view.js';
import { getEligibility, buildLetterSnapshot } from '../../services/hr/letters.service.js';

export async function getLetters(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  let filter: any = {};
  if (!isAdmin) {
    const isManager = auth.role === 'employee' && (auth.designation?.includes('Manager') || auth.permissions?.manageTeam);
    if (isManager) {
      const team = await UsersModel.find({ manager: auth._id }, { _id: 1 }).lean();
      const ids = [auth._id, ...team.map((u) => u._id)];
      filter = { employee: { $in: ids } };
    } else {
      filter = { employee: auth._id };
    }
  }

  const list = await EmployeeLettersModel.find(filter).sort({ created: -1 }).lean();
  res.json({ letters: list });
}

export async function getEmployeeLetters(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const { employeeId } = req.params;
  const target = await UsersModel.findById(employeeId).lean();
  if (!target) return sendPbError(res, 404, 'Employee not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && auth._id !== employeeId && target.manager !== auth._id) {
    return sendPbError(res, 403, 'Unauthorized.');
  }

  const list = await EmployeeLettersModel.find({ employee: employeeId }).sort({ created: -1 }).lean();
  const eligibility = getEligibility(target);
  res.json({ letters: list, employee: target, eligibility });
}

export async function getLetterById(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const letter = await EmployeeLettersModel.findById(req.params.id).lean();
  if (!letter) return sendPbError(res, 404, 'Letter not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && letter.employee !== auth._id) {
    const emp = await UsersModel.findById(letter.employee).lean();
    if (!emp || emp.manager !== auth._id) return sendPbError(res, 403, 'Unauthorized.');
  }

  res.json({ letter });
}

export async function generateLetter(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const { employeeId, letterType, relievingDate, lastWorkingDay } = req.body || {};
  if (!employeeId || !['Appointment', 'Experience'].includes(letterType)) {
    return sendPbError(res, 400, 'Valid employeeId and letterType are required.');
  }

  const emp = await UsersModel.findById(employeeId).lean();
  if (!emp) return sendPbError(res, 404, 'Employee not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && emp.manager !== auth._id) {
    return sendPbError(res, 403, 'Only admins or the employee manager can generate letters.');
  }

  const elig = getEligibility(emp);
  if (letterType === 'Appointment' && !elig.apptEligible) {
    return sendPbError(res, 400, `Appointment letter not eligible until ${elig.apptEligibleDate}.`);
  }
  if (letterType === 'Experience' && !elig.expEligible) {
    return sendPbError(res, 400, `Experience letter not eligible until ${elig.expEligibleDate}.`);
  }

  const { snapshot, missing } = await buildLetterSnapshot(emp, letterType, { relievingDate, lastWorkingDay });
  if (missing.length > 0) {
    return sendPbError(res, 400, `Missing required data: ${missing.join(', ')}`);
  }

  const prior = await EmployeeLettersModel.find({ employee: employeeId, letterType, status: 'Generated' }).lean();
  const nextVersion = (prior.length > 0 ? Math.max(...prior.map((p) => Number(p.version || 0))) : 0) + 1;
  const actorName = auth.name || auth.email || 'Admin';

  const doc = await EmployeeLettersModel.create({
    employee: employeeId,
    employeeName: emp.name || '',
    employeeId: emp.employeeId || '',
    department: emp.department || '',
    designation: emp.designation || '',
    letterType,
    status: 'Generated',
    eligibleDate: letterType === 'Appointment' ? elig.apptEligibleDate : elig.expEligibleDate,
    generatedAt: new Date().toISOString(),
    generatedBy: auth._id,
    generatedByName: actorName,
    version: nextVersion,
    snapshot,
    relievingDate: snapshot.relievingDate || '',
    lastWorkingDay: snapshot.lastWorkingDay || '',
  });

  try {
    await NotificationsModel.create({
      recipient: employeeId,
      title: `Your ${letterType.toLowerCase()} letter has been issued`,
      message: `Your ${letterType} letter (v${nextVersion}) has been generated.`,
      category: 'System',
      link: '/portal/employee?view=letters',
      senderName: actorName,
      read: false,
    });
  } catch (_) {}

  res.json({ ok: true, letter: doc.toObject() });
}

export async function autoGenerateLetters(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const isManager = auth.role === 'employee' && (auth.designation?.includes('Manager') || auth.permissions?.manageTeam);
  if (!isAdmin && !isManager) return sendPbError(res, 403, 'Permission denied.');

  const filter: any = { role: 'employee' };
  if (!isAdmin) filter.manager = auth._id;
  const employees = await UsersModel.find(filter).lean();

  let generated = 0;
  for (const emp of employees) {
    const elig = getEligibility(emp);
    if (elig.apptEligible) {
      const existing = await EmployeeLettersModel.findOne({ employee: emp._id, letterType: 'Appointment', status: 'Generated' });
      if (!existing) {
        const { snapshot, missing } = await buildLetterSnapshot(emp, 'Appointment');
        if (missing.length === 0) {
          await EmployeeLettersModel.create({
            employee: emp._id,
            employeeName: emp.name || '',
            employeeId: emp.employeeId || '',
            department: emp.department || '',
            designation: emp.designation || '',
            letterType: 'Appointment',
            status: 'Generated',
            eligibleDate: elig.apptEligibleDate,
            generatedAt: new Date().toISOString(),
            generatedBy: auth._id,
            generatedByName: auth.name || 'System',
            version: 1,
            snapshot,
          });
          generated++;
        }
      }
    }
  }

  res.json({ ok: true, scanned: employees.length, generated });
}

