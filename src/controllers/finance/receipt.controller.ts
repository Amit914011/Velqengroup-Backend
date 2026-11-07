import { Request, Response } from 'express';
import { PaymentReceiptsModel } from '../../models/payment_receipts.js';
import { UsersModel } from '../../models/users.js';
import { sendPbError } from '../../views/error.view.js';
import { generateReceiptNumber } from '../../services/finance/receipt.service.js';
import { generatePbId } from '../../utils/idGenerator.js';

function canManageReceipts(auth: any): boolean {
  if (auth.role === 'admin' || auth.isSuperuser) return true;
  const p = auth.permissions || {};
  return !!(p.manageTeam || p.viewReports);
}

export async function punchReceipt(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageReceipts(auth)) {
    return sendPbError(res, 403, 'You do not have permission to punch receipts.');
  }

  const body = req.body || {};
  const employeeId = String(body.employee || '').trim();
  if (!employeeId) return sendPbError(res, 400, 'Employee (team member) is required.');

  const emp = await UsersModel.findById(employeeId).lean();
  if (!emp) return sendPbError(res, 404, 'Employee not found.');

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin && emp.manager !== (auth._id || auth.id)) {
    return sendPbError(res, 403, 'This employee is not on your team.');
  }
  if (['Left', 'Resigned', 'Terminated'].includes(emp.employeeStatus || '')) {
    return sendPbError(res, 400, `Cannot punch a receipt for an employee who is ${emp.employeeStatus}.`);
  }

  const amount = Number(body.amount || 0) || 0;
  const dept = body.department || 'Tour & Travel';
  const receiptNumber = body.receiptNumber || (await generateReceiptNumber(dept));
  const actorName = auth.name || auth.email || 'Manager';
  const actorEmail = auth.email || '';

  const doc = new PaymentReceiptsModel({
    _id: generatePbId(),
    receiptNumber,
    employee: employeeId,
    employeeName: emp.name || emp.email || '',
    amount,
    paymentDate: body.paymentDate || new Date().toISOString().slice(0, 10),
    paymentMethod: body.paymentMethod || '',
    paymentMethodOther: body.paymentMethodOther || '',
    department: dept,
    subCategory: body.subCategory || '',
    clientName: body.clientName || '',
    clientPhone: body.clientPhone || '',
    clientEmail: body.clientEmail || '',
    clientCode: body.clientCode || '',
    linkedClientId: body.linkedClientId || '',
    paymentType: body.paymentType || 'Received',
    reference: body.reference || '',
    remarks: body.remarks || '',
    gstNumber: body.gstNumber || '',
    clientIdProofType: body.clientIdProofType || '',
    clientIdProofNumber: body.clientIdProofNumber || '',
    receivedBy: actorName,
    tax_applicable: !!body.tax_applicable,
    tax_rate: Number(body.tax_rate || 0) || 0,
    tax_treatment: body.tax_treatment || 'Exclusive',
    taxable_amount: Number(body.taxable_amount || 0) || 0,
    tax_amount: Number(body.tax_amount || 0) || 0,
    round_off: Number(body.round_off || 0) || 0,
    grand_total: Number(body.grand_total || amount) || amount,
    amount_paid: Number(body.amount_paid || amount) || amount,
    balance_due: Number(body.balance_due || 0) || 0,
    pos_applicable: !!body.pos_applicable,
    pos_mdr_rate: Number(body.pos_mdr_rate || 0) || 0,
    pos_mdr_gst_rate: Number(body.pos_mdr_gst_rate || 0) || 0,
    pos_mdr_amount: Number(body.pos_mdr_amount || 0) || 0,
    pos_mdr_gst_amount: Number(body.pos_mdr_gst_amount || 0) || 0,
    pos_total_charges: Number(body.pos_total_charges || 0) || 0,
    pos_net_settlement: Number(body.pos_net_settlement || 0) || 0,
    createdByName: actorName,
    createdByEmail: actorEmail,
    updatedByName: actorName,
    approvalStatus: amount > 5000 ? 'Pending' : 'Approved',
    deleted: false,
  });

  await doc.save();
  res.json({ success: true, id: doc._id, receiptNumber });
}

export async function getMyReceipts(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageReceipts(auth)) {
    return sendPbError(res, 403, 'You do not have permission to view receipts.');
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  const actorEmail = auth.email || '';
  let filter: any = { deleted: { $ne: true } };

  if (!isAdmin) {
    const team = await UsersModel.find({ manager: auth._id || auth.id }, { _id: 1 }).lean();
    const teamIds = team.map((u) => u._id);
    filter = {
      deleted: { $ne: true },
      $or: [{ createdByEmail: actorEmail }, { employee: { $in: teamIds } }],
    };
  }

  const recs = await PaymentReceiptsModel.find(filter).sort({ created: -1 }).limit(500).lean();
  res.json({ receipts: recs });
}

export async function approveReceipt(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canManageReceipts(auth)) {
    return sendPbError(res, 403, 'You do not have permission to approve receipts.');
  }

  const { receiptId, action = 'approve' } = req.body || {};
  if (!receiptId) return sendPbError(res, 400, 'receiptId is required.');

  const rec = await PaymentReceiptsModel.findById(receiptId);
  if (!rec) return sendPbError(res, 404, 'Receipt not found.');

  const amount = Number(rec.amount || 0);
  if (amount <= 5000) {
    return sendPbError(res, 400, 'This receipt does not require approval (amount is ₹5,000 or below).');
  }

  const act = String(action).toLowerCase() === 'reject' ? 'reject' : 'approve';
  if (act === 'approve' && rec.approvalStatus === 'Approved') {
    return res.json({
      success: true,
      alreadyApproved: true,
      approvalStatus: 'Approved',
      approvedBy: rec.approvedBy || '',
      approvedByRole: rec.approvedByRole || '',
      approvedByEmail: rec.approvedByEmail || '',
      approvedAt: rec.approvedAt || '',
    }) as unknown as void;
  }
  if (act === 'reject' && rec.approvalStatus === 'Approved') {
    return sendPbError(res, 400, 'Cannot reject a receipt that is already approved.');
  }

  const isAdmin = auth.role === 'admin' || auth.isSuperuser;
  if (!isAdmin) {
    const emp = await UsersModel.findById(rec.employee).lean();
    if (!emp || emp.manager !== (auth._id || auth.id)) {
      return sendPbError(res, 403, 'You can only approve receipts for your own team members.');
    }
  }

  const actorName = auth.name || auth.email || (isAdmin ? 'Founder' : 'Manager');
  const actorRole = isAdmin ? 'Founder' : 'Manager';
  const nowIso = new Date().toISOString();

  rec.approvalStatus = act === 'approve' ? 'Approved' : 'Rejected';
  rec.approvedBy = actorName;
  rec.approvedById = auth._id || auth.id;
  rec.approvedByRole = actorRole;
  rec.approvedByEmail = auth.email || '';
  rec.approvedAt = nowIso;
  rec.updatedByName = actorName;

  await rec.save();
  res.json({
    success: true,
    approvalStatus: rec.approvalStatus,
    approvedBy: rec.approvedBy,
    approvedByRole: rec.approvedByRole,
    approvedByEmail: rec.approvedByEmail,
  });
}

