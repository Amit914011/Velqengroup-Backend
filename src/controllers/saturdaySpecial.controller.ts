import { Request, Response } from 'express';
import { SaturdaySpecialConfigModel } from '../models/saturday_special_config.js';

// Calculate IST phase based on Saturday Special schedule configuration
function computeSchedulePhase(cfg: any): { enabled: boolean; dayOfWeek: number; phase: string; lockEnd: number } {
  let enabled = false;
  let dayOfWeek = 6;
  let phase = 'normal';
  let popupAt = 17 * 60 + 25;
  let lockStart = 17 * 60 + 30;
  let lockEnd = 18 * 60 + 25;

  if (cfg) {
    enabled = Boolean(cfg.enabled);
    dayOfWeek = typeof cfg.dayOfWeek === 'number' ? cfg.dayOfWeek : 6;
    popupAt = (Number(cfg.popupHour) || 17) * 60 + (Number(cfg.popupMinute) || 25);
    lockStart = (Number(cfg.lockStartHour) || 17) * 60 + (Number(cfg.lockStartMinute) || 30);
    lockEnd = (Number(cfg.lockEndHour) || 18) * 60 + (Number(cfg.lockEndMinute) || 25);

    if (enabled) {
      const ist = new Date(Date.now() + 330 * 60000);
      if (ist.getUTCDay() === dayOfWeek) {
        const m = ist.getUTCHours() * 60 + ist.getUTCMinutes();
        if (m >= lockStart && m < lockEnd) phase = 'locked';
        else if (m >= popupAt && m < lockStart) phase = 'popup';
        else if (m >= lockEnd) phase = 'verify';
      }
    }
  }
  return { enabled, dayOfWeek, phase, lockEnd };
}

// GET /api/saturday-special/status - Authoritative current schedule phase
export async function getSaturdaySpecialStatus(req: Request, res: Response): Promise<void> {
  try {
    const auth = (req as any).auth;
    const role = String(auth?.role || '').toLowerCase();
    const cfg = await SaturdaySpecialConfigModel.findOne().lean();
    const { enabled, dayOfWeek, phase, lockEnd } = computeSchedulePhase(cfg);

    let applicable = true;
    if (auth && role && role !== 'employee') applicable = false;

    res.json({
      enabled,
      dayOfWeek,
      phase,
      applicable,
      hasConfig: Boolean(cfg),
      role,
      serverTime: new Date().toISOString(),
      lockEndHour: Math.floor(lockEnd / 60),
      lockEndMinute: lockEnd % 60,
    });
  } catch (err: any) {
    res.json({ enabled: false, phase: 'normal', applicable: true, hasConfig: false, serverTime: new Date().toISOString(), error: err.message });
  }
}

// GET /api/saturday-special/config - Returns display copy and schedule configuration
export async function getSaturdaySpecialConfig(_req: Request, res: Response): Promise<void> {
  try {
    const cfg = await SaturdaySpecialConfigModel.findOne().lean();
    if (cfg) {
      const { _id, created, updated, ...fields } = cfg as any;
      res.json({ ok: true, id: _id, config: fields });
      return;
    }
    res.json({ ok: true, id: '', config: null });
  } catch (err: any) {
    res.json({ ok: false, id: '', config: null, error: err.message });
  }
}

// Check if write operations should be blocked during Saturday lock
export async function isSaturdayLockActive(auth: any, col: string): Promise<boolean> {
  if (!auth || String(auth.role || '').toLowerCase() !== 'employee') return false;
  const lockedCols = new Set([
    'leads', 'lead_notes', 'salary_slips', 'salary_records', 'salary_slip_requests',
    'salary_slip_audit', 'documents', 'employee_documents', 'payment_receipts',
    'financial_transactions', 'targets', 'eod_reports', 'communications', 'support_tickets',
    'recruitment_candidates', 'recruitment_interviews', 'recruitment_hire_requests',
    'resignation_requests', 'fo_emails',
  ]);
  if (!lockedCols.has(col)) return false;

  const cfg = await SaturdaySpecialConfigModel.findOne().lean();
  const { phase } = computeSchedulePhase(cfg);
  return phase === 'locked';
}

