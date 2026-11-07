import { PaymentReceiptsModel } from '../../models/payment_receipts.js';

export const DEFAULT_TAX_RATE = 18;
export const DEFAULT_MDR_RATE = 2.25;
export const DEFAULT_MDR_GST_RATE = 18;

export const round2 = (n: number | string | null | undefined): number => {
  const v = Number(n) || 0;
  return Math.round((v + Number.EPSILON) * 100) / 100;
};

const num = (n: unknown): number => {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function calculateReceipt(input: any = {}): any {
  const amount = round2(num(input.amount));
  const rate = round2(num(input.taxRate) || (input.taxApplicable ? DEFAULT_TAX_RATE : 0));
  const applicable = !!input.taxApplicable && rate > 0;
  const treatment = applicable && String(input.taxTreatment).toLowerCase() === 'inclusive' ? 'Inclusive' : 'Exclusive';

  let taxableAmount = amount;
  let taxAmount = 0;
  let roundOff = 0;
  let grandTotal = amount;

  if (applicable) {
    if (treatment === 'Inclusive') {
      taxableAmount = round2(amount / (1 + rate / 100));
      taxAmount = round2(amount - taxableAmount);
    } else {
      taxAmount = round2((amount * rate) / 100);
      const rawTotal = round2(taxableAmount + taxAmount);
      const roundedTotal = Math.round(rawTotal);
      roundOff = round2(roundedTotal - rawTotal);
      grandTotal = round2(rawTotal + roundOff);
    }
  }

  const amountPaid = round2(num(input.amountPaid));
  const balanceDue = round2(Math.max(0, grandTotal - amountPaid));

  return {
    amount, taxApplicable: applicable, taxRate: rate, taxTreatment: treatment,
    taxableAmount, taxAmount, roundOff, grandTotal, amountPaid, balanceDue,
  };
}

export function calculatePosSettlement(input: any = {}): any {
  const gross = round2(num(input.grossReceipt));
  const mdrRate = round2(num(input.mdrRate) || DEFAULT_MDR_RATE);
  const mdrGstRate = round2(num(input.mdrGstRate) || DEFAULT_MDR_GST_RATE);
  const mdrAmount = round2((gross * mdrRate) / 100);
  const mdrGstAmount = round2((mdrAmount * mdrGstRate) / 100);
  const totalPosCharges = round2(mdrAmount + mdrGstAmount);
  const netSettlement = round2(gross - totalPosCharges);
  return { grossReceipt: gross, mdrRate, mdrGstRate, mdrAmount, mdrGstAmount, totalPosCharges, netSettlement };
}

const DEPT_CODES: Record<string, string> = {
  'Tour & Travel': 'VV', 'Real Estate': 'VE', 'Logistics': 'VL', 'Trading': 'VT', 'Visa Immigration': 'VI',
};

export async function generateReceiptNumber(dept = 'Tour & Travel'): Promise<string> {
  const code = DEPT_CODES[dept] || 'VV';
  const prefix = `VG007726${code}`;
  const start = 10001;

  const docs = await PaymentReceiptsModel.find({ receiptNumber: { $regex: `^${prefix}` } }, { receiptNumber: 1 }).lean();
  let max = start - 1;
  const regex = new RegExp(`^${prefix}(\\d+)$`);
  for (const d of docs) {
    const m = regex.exec(d.receiptNumber || '');
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  return `${prefix}${max + 1}`;
}

