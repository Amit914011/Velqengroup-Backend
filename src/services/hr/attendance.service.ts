export const SEASONAL_SUMMER_END = '18:30'; // Feb–Oct
export const SEASONAL_WINTER_END = '17:30'; // Nov–Jan
export const DEFAULT_SHIFT_START = '10:00';
export const IST_TZ = 'Asia/Kolkata';

export interface ISTParts {
  y: string;
  m: string;
  d: string;
  hh: string;
  mm: string;
}

export function istParts(date: Date | string | number = new Date()): ISTParts {
  const d = date instanceof Date ? date : new Date(date);
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts: Record<string, string> = {};
  fmt.formatToParts(d).forEach((p) => {
    parts[p.type] = p.value;
  });
  return {
    y: parts.year || '1970',
    m: parts.month || '01',
    d: parts.day || '01',
    hh: parts.hour === '24' ? '00' : parts.hour || '00',
    mm: parts.minute || '00',
  };
}

export function istDateStr(date: Date | string | number = new Date()): string {
  const { y, m, d } = istParts(date);
  return `${y}-${m}-${d}`;
}

export function istTimeStr(date: Date | string | number = new Date()): string {
  const { hh, mm } = istParts(date);
  return `${hh}:${mm}`;
}

export function istMinutesOfDay(date: Date | string | number = new Date()): number {
  const { hh, mm } = istParts(date);
  return Number(hh) * 60 + Number(mm);
}

export function seasonalShiftEnd(date: Date = new Date()): string {
  const { m } = istParts(date);
  const month = Number(m);
  return month >= 2 && month <= 10 ? SEASONAL_SUMMER_END : SEASONAL_WINTER_END;
}

export function seasonalShift(date: Date = new Date()): { start: string; end: string } {
  return { start: DEFAULT_SHIFT_START, end: seasonalShiftEnd(date) };
}

export function resolveShift(user: any, date: Date = new Date()): { start: string; end: string } {
  const season = seasonalShift(date);
  return {
    start: user?.shiftStart || season.start,
    end: user?.shiftEnd || season.end,
  };
}

export function shiftToMinutes(str?: string | null, fallback = 600): number {
  if (!str || !/^\d{1,2}:\d{2}$/.test(str)) return fallback;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

const EXIT_STATUSES = new Set(['left', 'resigned', 'terminated', 'exited', 'inactive']);

export function getResignationCutoff(user: any): string {
  if (!user) return '';
  const status = String(user.employeeStatus || '').trim().toLowerCase();
  if (!EXIT_STATUSES.has(status)) return '';
  return user.lastWorkingDay || user.resignationDate || '';
}

export function isAttendanceBlocked(user: any, date = istDateStr()): boolean {
  const cutoff = getResignationCutoff(user);
  if (!cutoff) return false;
  return date > cutoff;
}

