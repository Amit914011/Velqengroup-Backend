import { RecipientsModel } from '../../models/recipients.js';
import { UsersModel } from '../../models/users.js';
import { CompanyExpensesModel } from '../../models/company_expenses.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function fetchExpenseOptions() {
  const recipients = await RecipientsModel.find({ deleted: { $ne: true } }, { _id: 1, name: 1, type: 1 })
    .sort({ name: 1 })
    .lean();

  const employees = await UsersModel.find({ role: 'employee' }, { _id: 1, name: 1, email: 1, employeeId: 1 })
    .sort({ name: 1 })
    .lean();

  return {
    recipients: recipients.map((r) => ({ id: r._id, name: r.name || '', type: r.type || '' })),
    employees: employees.map((u) => ({
      id: u._id,
      name: u.name || u.email || '',
      employeeId: u.employeeId || '',
    })),
  };
}

export async function recordExpense(auth: any, data: any) {
  const title = String(data.title || '').trim();
  if (!title) throw new Error('Title is required.');

  let recipientName = '';
  if (data.recipientId) {
    const rec = await RecipientsModel.findById(data.recipientId).lean();
    if (rec) recipientName = rec.name || '';
  }

  let advanceEmployeeName = '';
  if (data.advanceEmployee) {
    const u = await UsersModel.findById(data.advanceEmployee).lean();
    if (u) advanceEmployeeName = u.name || u.email || '';
  }

  const actorName = auth.name || auth.email || 'Manager';
  const amount = Number(data.amount || 0) || 0;
  const paymentStatus = data.paymentStatus || 'Pending';
  const nowIso = new Date().toISOString();

  const doc = new CompanyExpensesModel({
    _id: generatePbId(),
    title,
    category: data.category || '',
    expenseDate: data.expenseDate || nowIso.slice(0, 10),
    amount,
    paymentStatus,
    paymentMethod: data.paymentMethod || '',
    paymentMethodOther: data.paymentMethodOther || '',
    note: data.note || '',
    reason: data.reason || '',
    recipientId: data.recipientId || null,
    recipientName,
    advanceEmployee: data.advanceEmployee || '',
    advanceEmployeeName,
    submittedBy: auth._id || auth.id,
    submittedByName: actorName,
    submittedByEmail: auth.email || '',
    createdByName: actorName,
    updatedByName: actorName,
    history: [{ at: nowIso, actor: actorName, action: 'Created', details: `Amount ${amount} · ${paymentStatus}` }],
    attachment: data.attachment || '',
    deleted: false,
  });

  await doc.save();
  return doc.toObject();
}

