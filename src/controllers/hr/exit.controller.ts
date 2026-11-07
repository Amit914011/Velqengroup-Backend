import { Request, Response } from 'express';
import { UsersModel } from '../../models/users.js';
import { ExitRecordsModel } from '../../models/exit_records.js';
import { sendPbError } from '../../views/error.view.js';
import { saveUploadedFile } from '../../services/storage.service.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function markExitAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const isManager = auth.role === 'admin' || auth.isSuperuser || auth.permissions?.manageTeam || auth.designation?.includes('Manager');
  if (!isManager) return sendPbError(res, 403, 'Permission denied.');

  const { employee: employeeId, exitDate, reason, remarks, employeeStatus: targetStatus = 'Resigned' } = req.body || {};
  if (!employeeId || !exitDate || !reason) {
    return sendPbError(res, 400, 'employee, exitDate, and reason are required.');
  }

  const emp = await UsersModel.findById(employeeId);
  if (!emp) return sendPbError(res, 404, 'Employee not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && emp.manager !== auth._id) {
    return sendPbError(res, 403, 'You can only mark exit for an employee assigned to you.');
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const fileMap: Record<string, string> = {};
  const recId = generatePbId();

  for (const f of files) {
    if (['acknowledgementDocument', 'ffDocument', 'nocDocument'].includes(f.fieldname)) {
      const saved = await saveUploadedFile('exit_records', recId, f.originalname, f.buffer);
      fileMap[f.fieldname] = saved;
    }
  }

  const actor = auth.name || auth.email || 'Manager';
  const exitRec = await ExitRecordsModel.create({
    _id: recId,
    employee: employeeId,
    employeeName: emp.name || emp.email || '',
    exitDate,
    reason,
    remarks: String(remarks || '').slice(0, 3000),
    status: 'Completed',
    employeeStatus: targetStatus,
    acknowledgementDocument: fileMap.acknowledgementDocument || '',
    ffDocument: fileMap.ffDocument || '',
    nocDocument: fileMap.nocDocument || '',
    createdByName: actor,
    updatedByName: actor,
  });

  emp.employeeStatus = targetStatus;
  emp.resignationDate = exitDate;
  emp.lastWorkingDay = exitDate;
  await emp.save();

  res.json({ success: true, exitRecord: exitRec.toObject() });
}
