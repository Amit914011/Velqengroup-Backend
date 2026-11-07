import { PaymentReferencesModel } from '../../models/payment_references.js';
import { generatePbId } from '../../utils/idGenerator.js';

export function getQuickPayStatus() {
  return {
    ok: true,
    paypalPaymentUrl: process.env.PAYPAL_PAYMENT_URL || 'https://www.paypal.com/paypalme/my/profile',
    upiId: process.env.UPI_ID || 'pos.5379925@indus',
  };
}

export async function submitPaymentReference(body: any, ip = '', userAgent = '') {
  const transactionRef = String(body.transactionRef || body.transactionReference || '').trim().toUpperCase();
  const amountPaid = Number(body.amountPaid || body.amount || 0);

  if (!transactionRef) throw new Error('Transaction reference number is required.');
  if (amountPaid <= 0) throw new Error('A valid positive payment amount is required.');

  const existing = await PaymentReferencesModel.findOne({ transactionRef }).lean();
  if (existing) {
    throw new Error('This transaction reference has already been submitted.');
  }

  const doc = new PaymentReferencesModel({
    _id: generatePbId(),
    clientName: String(body.clientName || '').trim(),
    clientCode: String(body.clientCode || '').trim(),
    phone: String(body.phone || '').trim(),
    amountPaid,
    paymentMethod: String(body.paymentMethod || 'Other').trim(),
    transactionRef,
    paymentDate: body.paymentDate || new Date().toISOString(),
    screenshot: String(body.screenshot || ''),
    status: 'pending_verification',
    notes: String(body.notes || '').trim(),
    ip,
    userAgent,
  });
  await doc.save();

  return { success: true, referenceId: doc._id, status: doc.status };
}

