import { Request, Response } from 'express';
import { EmployeeChangeRequestsModel } from '../../models/employee_change_requests.js';
import { NotificationsModel } from '../../models/notifications.js';
import { sendPbError } from '../../views/error.view.js';
import { applyApprovedValues, directAddEmployee } from '../../services/hr/employeeChange.service.js';

export async function approveChangeRequest(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Only administrators can approve change requests.');
  }

  const { requestId } = req.body || {};
  const request = await EmployeeChangeRequestsModel.findById(requestId);
  if (!request) return sendPbError(res, 404, 'Change request not found.');
  if (request.status !== 'Pending') return sendPbError(res, 400, 'Request is already processed.');

  let targetUser: any = null;
  if (request.requestType === 'add') {
    targetUser = await directAddEmployee({ _id: request.manager, department: '' }, request.newValues || {});
  } else {
    targetUser = await applyApprovedValues(request.employee || '', request.newValues || {});
  }

  request.status = 'Approved';
  request.reviewedBy = auth._id;
  request.reviewedAt = new Date().toISOString();
  await request.save();

  try {
    await NotificationsModel.create({
      recipient: request.manager,
      title: 'Employee Request Approved',
      message: `Your ${request.requestType} request for ${request.employeeName} has been approved.`,
      read: false,
      type: 'employee_change',
    });
  } catch (_) {}

  res.json({ success: true, user: targetUser });
}

export async function rejectChangeRequest(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Only administrators can reject change requests.');
  }

  const { requestId, reviewNote } = req.body || {};
  const request = await EmployeeChangeRequestsModel.findById(requestId);
  if (!request) return sendPbError(res, 404, 'Change request not found.');
  if (request.status !== 'Pending') return sendPbError(res, 400, 'Request is already processed.');

  request.status = 'Rejected';
  request.adminComments = reviewNote || '';
  request.reviewedBy = auth._id;
  request.reviewedAt = new Date().toISOString();
  await request.save();

  try {
    await NotificationsModel.create({
      recipient: request.manager,
      title: 'Employee Request Rejected',
      message: `Your request for ${request.employeeName} was rejected: ${reviewNote || 'No reason provided.'}`,
      read: false,
      type: 'employee_change',
    });
  } catch (_) {}

  res.json({ success: true });
}

export async function bulkProcessRequests(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && !auth.isSuperuser)) {
    return sendPbError(res, 403, 'Only administrators can process requests in bulk.');
  }

  const { requestIds, action, note } = req.body || {};
  if (!Array.isArray(requestIds) || !['approve', 'reject'].includes(action)) {
    return sendPbError(res, 400, 'Invalid requestIds or action.');
  }

  let processed = 0;
  for (const id of requestIds) {
    const reqDoc = await EmployeeChangeRequestsModel.findById(id);
    if (reqDoc && reqDoc.status === 'Pending') {
      if (action === 'approve') {
        if (reqDoc.requestType === 'add') {
          await directAddEmployee({ _id: reqDoc.manager, department: '' }, reqDoc.newValues || {});
        } else {
          await applyApprovedValues(reqDoc.employee || '', reqDoc.newValues || {});
        }
        reqDoc.status = 'Approved';
      } else {
        reqDoc.status = 'Rejected';
        reqDoc.adminComments = note || '';
      }
      reqDoc.reviewedBy = auth._id;
      reqDoc.reviewedAt = new Date().toISOString();
      await reqDoc.save();
      processed++;
    }
  }

  res.json({ success: true, processed });
}

