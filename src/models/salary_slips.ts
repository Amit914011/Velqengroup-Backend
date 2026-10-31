import mongoose, { Schema, Model } from 'mongoose';

export interface ISalarySlips {
  _id: string;
  employee?: string | null;
  employeeName?: string;
  employeeCode?: string;
  month?: string;
  year?: string;
  basicSalary?: number;
  leaveDeduction?: number;
  advanceDeduction?: number;
  miscDeduction?: number;
  miscDescription?: string;
  grossSalary?: number;
  totalDeductions?: number;
  netSalary?: number;
  status?: string;
  paymentDate?: string;
  department?: string;
  subCategory?: string;
  allowances?: number;
  incentives?: number;
  leavesTaken?: number;
  panNumber?: string;
  bankName?: string;
  bankAccountLast4?: string;
  paymentMethod?: string;
  paymentMethodOther?: string;
  createdByName?: string;
  updatedByName?: string;
  fromDate?: string;
  toDate?: string;
  designation?: string;
  joiningDate?: string;
  employeePhone?: string;
  workingDays?: number;
  presentDays?: number;
  absentDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  lateComingDays?: number;
  lateHours?: number;
  dailyRate?: number;
  presentDaysSalary?: number;
  paidLeaveSalary?: number;
  unpaidLeaveDeduction?: number;
  lateComingDeduction?: number;
  absentDaysDeduction?: number;
  hourlyRate?: number;
  lastSyncedAt?: string;
  syncSummary?: string;
  syncStatus?: string;
  lateDeductionEnabled?: boolean;
  lateMinorDays?: number;
  lateMajorDays?: number;
  lateMinorDeduction?: number;
  lateMajorDeduction?: number;
  shortHoursDays?: number;
  shortHoursMinutes?: number;
  shortHoursTotal?: number;
  shortHoursDeduction?: number;
  lateWaiveOffEnabled?: boolean;
  lateWaiveOffAmount?: number;
  lateWaiveOffReason?: string;
  lateWaiveOffBy?: string;
  lateWaiveOffAt?: string;
  lateWaiveOffDays?: Record<string, any> | any[] | any;
  remainingDays?: number;
  deductionSelection?: Record<string, any> | any[] | any;
  halfDayDays?: number;
  halfDayDeduction?: number;
  manualPresentDays?: number;
  presentDaysManual?: boolean;
  eligibleWorkingDays?: number;
  isFullFinal?: boolean;
  noDues?: boolean;
  resignationDate?: string;
  lastWorkingDay?: string;
  version?: number;
  isFinal?: boolean;
  versionLabel?: string;
  salaryCreditDate?: string;
  sickLeaveDays?: number;
  maternityLeaveDays?: number;
  ncnsDays?: number;
  sandwichDays?: number;
  ncnsDeduction?: number;
  sandwichDeduction?: number;
  otAmount?: number;
  approvedOtHours?: number;
  govHolidayOtHours?: number;
  companyHolidayOtHours?: number;
  sundayWeeklyOffOtHours?: number;
  afterShiftOtHours?: number;
  holidayWorkedDays?: number;
  sundayWorkedDays?: number;
  created?: Date;
  updated?: Date;
}

export const SalarySlipsSchema = new Schema<ISalarySlips>(
  {
  _id: { type: String, required: true },
  employee: { type: String, ref: 'users', default: null, index: true },
  employeeName: { type: String, default: '' },
  employeeCode: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  basicSalary: { type: Number, default: 0 },
  leaveDeduction: { type: Number, default: 0 },
  advanceDeduction: { type: Number, default: 0 },
  miscDeduction: { type: Number, default: 0 },
  miscDescription: { type: String, default: '' },
  grossSalary: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, default: 0 },
  status: { type: String, default: '' },
  paymentDate: { type: String, default: '' },
  department: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  allowances: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  leavesTaken: { type: Number, default: 0 },
  panNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  bankAccountLast4: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  paymentMethodOther: { type: String, default: '' },
  createdByName: { type: String, default: '' },
  updatedByName: { type: String, default: '' },
  fromDate: { type: String, default: '' },
  toDate: { type: String, default: '' },
  designation: { type: String, default: '' },
  joiningDate: { type: String, default: '' },
  employeePhone: { type: String, default: '' },
  workingDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  paidLeaveDays: { type: Number, default: 0 },
  unpaidLeaveDays: { type: Number, default: 0 },
  lateComingDays: { type: Number, default: 0 },
  lateHours: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  presentDaysSalary: { type: Number, default: 0 },
  paidLeaveSalary: { type: Number, default: 0 },
  unpaidLeaveDeduction: { type: Number, default: 0 },
  lateComingDeduction: { type: Number, default: 0 },
  absentDaysDeduction: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  lastSyncedAt: { type: String, default: '' },
  syncSummary: { type: String, default: '' },
  syncStatus: { type: String, default: '' },
  lateDeductionEnabled: { type: Boolean, default: false },
  lateMinorDays: { type: Number, default: 0 },
  lateMajorDays: { type: Number, default: 0 },
  lateMinorDeduction: { type: Number, default: 0 },
  lateMajorDeduction: { type: Number, default: 0 },
  shortHoursDays: { type: Number, default: 0 },
  shortHoursMinutes: { type: Number, default: 0 },
  shortHoursTotal: { type: Number, default: 0 },
  shortHoursDeduction: { type: Number, default: 0 },
  lateWaiveOffEnabled: { type: Boolean, default: false },
  lateWaiveOffAmount: { type: Number, default: 0 },
  lateWaiveOffReason: { type: String, default: '' },
  lateWaiveOffBy: { type: String, default: '' },
  lateWaiveOffAt: { type: String, default: '' },
  lateWaiveOffDays: { type: Schema.Types.Mixed, default: {} },
  remainingDays: { type: Number, default: 0 },
  deductionSelection: { type: Schema.Types.Mixed, default: {} },
  halfDayDays: { type: Number, default: 0 },
  halfDayDeduction: { type: Number, default: 0 },
  manualPresentDays: { type: Number, default: 0 },
  presentDaysManual: { type: Boolean, default: false },
  eligibleWorkingDays: { type: Number, default: 0 },
  isFullFinal: { type: Boolean, default: false },
  noDues: { type: Boolean, default: false },
  resignationDate: { type: String, default: '' },
  lastWorkingDay: { type: String, default: '' },
  version: { type: Number, default: 0 },
  isFinal: { type: Boolean, default: false },
  versionLabel: { type: String, default: '' },
  salaryCreditDate: { type: String, default: '' },
  sickLeaveDays: { type: Number, default: 0 },
  maternityLeaveDays: { type: Number, default: 0 },
  ncnsDays: { type: Number, default: 0 },
  sandwichDays: { type: Number, default: 0 },
  ncnsDeduction: { type: Number, default: 0 },
  sandwichDeduction: { type: Number, default: 0 },
  otAmount: { type: Number, default: 0 },
  approvedOtHours: { type: Number, default: 0 },
  govHolidayOtHours: { type: Number, default: 0 },
  companyHolidayOtHours: { type: Number, default: 0 },
  sundayWeeklyOffOtHours: { type: Number, default: 0 },
  afterShiftOtHours: { type: Number, default: 0 },
  holidayWorkedDays: { type: Number, default: 0 },
  sundayWorkedDays: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now },
  },
  {
    collection: 'salary_slips',
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

SalarySlipsSchema.index({"employee":1,"month":1,"year":1});

export const SalarySlipsModel = (mongoose.models['salary_slips'] as Model<ISalarySlips>) ||
  mongoose.model<ISalarySlips>('salary_slips', SalarySlipsSchema, 'salary_slips');

export default SalarySlipsModel;
