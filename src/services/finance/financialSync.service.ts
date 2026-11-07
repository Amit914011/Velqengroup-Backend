import { FinancialTransactionsModel } from '../../models/financial_transactions.js';
import { generatePbId } from '../../utils/idGenerator.js';

function toNum(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function day(s: any): string {
  return String(s || '').slice(0, 10);
}

function buildReceiptPayload(rec: any, base: any) {
  const ptype = rec.paymentType || 'Received';
  const approval = rec.approvalStatus || '';
  const isRefund = ptype === 'Refund';
  const baseAmt = toNum(rec.amount);
  const grand = toNum(rec.grand_total) || baseAmt;
  const counts = approval !== 'Rejected' && (approval === 'Approved' || baseAmt <= 5000);

  let status = 'PENDING';
  if (approval === 'Rejected') status = 'REJECTED';
  else if (counts) status = isRefund ? 'REFUNDED' : 'APPROVED';

  return {
    ...base,
    transaction_type: isRefund ? 'REFUND' : 'INCOME',
    department: rec.department || '',
    employee_id: rec.employee || '',
    client_id: rec.linkedClientId || '',
    receipt_id: rec.receiptNumber || '',
    amount: toNum(rec.taxable_amount) || baseAmt,
    tax_amount: toNum(rec.tax_amount),
    grand_total: grand,
    payment_method: rec.paymentMethod || '',
    status,
    description: (isRefund ? 'Refund — ' : 'Receipt — ') + (rec.clientName || rec.employeeName || rec.receiptNumber || ''),
    reference_number: rec.receiptNumber || '',
    transaction_date: day(rec.paymentDate),
    created_by: rec.createdBy || '',
    created_by_name: rec.createdByName || rec.receivedBy || '',
    approved_by_name: rec.approvedBy || '',
  };
}

function buildIncomePayload(rec: any, base: any) {
  const linkedLead = rec.linkedLead || '';
  return {
    ...base,
    transaction_type: 'INCOME',
    department: rec.department || '',
    client_id: rec.clientId || '',
    amount: toNum(rec.amount),
    tax_amount: 0,
    grand_total: toNum(rec.amount),
    payment_method: '',
    status: 'APPROVED',
    description: rec.title || rec.source || 'Income',
    reference_number: '',
    transaction_date: day(rec.incomeDate),
    created_by: rec.submittedBy || '',
    created_by_name: rec.submittedByName || '',
    is_duplicate_suppressed: !!linkedLead,
  };
}

function buildExpensePayload(rec: any, base: any) {
  const category = rec.category || 'Miscellaneous';
  const linkedReceipt = rec.linkedReceipt || '';
  return {
    ...base,
    transaction_type: 'EXPENSE',
    department: rec.department || '',
    amount: toNum(rec.amount),
    tax_amount: 0,
    grand_total: toNum(rec.amount),
    payment_method: rec.paymentMethod || '',
    status: rec.paymentStatus || 'Pending',
    description: rec.title || category,
    reference_number: '',
    transaction_date: day(rec.expenseDate),
    created_by: rec.submittedBy || '',
    created_by_name: rec.submittedByName || '',
    is_duplicate_suppressed: category === 'Refund' && !!linkedReceipt,
  };
}

function buildSalaryPayload(rec: any, base: any, coll: string) {
  if (coll === 'salary_slips') {
    const isPaid = rec.status === 'Locked' || rec.status === 'Paid';
    return {
      ...base,
      transaction_type: 'SALARY',
      department: rec.department || '',
      employee_id: rec.employee || '',
      amount: toNum(rec.netSalary),
      tax_amount: 0,
      grand_total: toNum(rec.netSalary),
      payment_method: '',
      status: isPaid ? 'PAID' : 'PENDING',
      description: 'Salary — ' + (rec.employeeName || 'Employee') + ' (' + (rec.month || '') + ')',
      reference_number: '',
      transaction_date: day(rec.salaryCreditDate || rec.toDate),
      salary_id: rec._id,
    };
  }
  if (coll === 'employee_advances') {
    return {
      ...base,
      transaction_type: 'ADVANCE',
      department: rec.department || '',
      employee_id: rec.employee || '',
      amount: toNum(rec.amount),
      tax_amount: 0,
      grand_total: toNum(rec.amount),
      payment_method: '',
      status: rec.status || 'Pending',
      description: 'Advance — ' + (rec.employeeName || 'Employee'),
      reference_number: '',
      transaction_date: day(rec.advanceDate),
    };
  }
  return null;
}

export function buildLedgerPayload(collectionName: string, rec: any) {
  if (!rec || !rec._id) return null;
  const base = {
    source_module: collectionName,
    source_record_id: rec._id,
    is_deleted: !!rec.deleted,
    is_duplicate_suppressed: false,
  };

  if (collectionName === 'payment_receipts') return buildReceiptPayload(rec, base);
  if (collectionName === 'company_income') return buildIncomePayload(rec, base);
  if (collectionName === 'company_expenses') return buildExpensePayload(rec, base);
  if (collectionName === 'salary_slips' || collectionName === 'employee_advances') {
    return buildSalaryPayload(rec, base, collectionName);
  }
  return null;
}

export async function syncLedgerTransaction(collectionName: string, rec: any): Promise<void> {
  const payload = buildLedgerPayload(collectionName, rec);
  if (!payload) {
    await FinancialTransactionsModel.deleteOne({ source_module: collectionName, source_record_id: rec._id });
    return;
  }

  const existing = await FinancialTransactionsModel.findOne({
    source_module: collectionName,
    source_record_id: rec._id,
  });

  if (existing) {
    Object.assign(existing, payload);
    existing.updated = new Date();
    await existing.save();
  } else {
    const row = new FinancialTransactionsModel({
      _id: generatePbId(),
      ...payload,
      created: new Date(),
      updated: new Date(),
    });
    await row.save();
  }
}

