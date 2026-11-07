import { registerUserHooks } from './userHooks.js';
import { registerAttendanceHooks } from './attendanceHooks.js';
import { registerHolidayHooks } from './holidayHooks.js';
import { registerChatHooks } from '../chat/chatHooks.js';
import { registerSalarySlipHooks } from './salarySlipHooks.js';

export function registerAllHrHooks(): void {
  registerUserHooks();
  registerAttendanceHooks();
  registerHolidayHooks();
  registerChatHooks();
  registerSalarySlipHooks();
}

