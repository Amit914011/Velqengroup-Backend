import crypto from 'node:crypto';

// Extract the last 4 numeric digits of an employee id
function lastFourDigits(employeeId?: string): string | null {
  const digits = String(employeeId || '').replace(/[^0-9]/g, '');
  return digits.length >= 4 ? digits.slice(-4) : null;
}

// Extract the birth year from a date of birth string
function birthYear(dob?: string): string | null {
  const s = String(dob || '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})[-/]/) || s.match(/[-/](\d{4})$/) || s.match(/^(\d{4})$/);
  return m ? m[1] : null;
}

// Generate the initial formula passcode: last4(empId) + birthYear + "6666"
export function generateInitialPasscode(employeeId?: string, dob?: string, userId?: string): string | null {
  let d = lastFourDigits(employeeId);
  if (!d && userId) {
    const hex = String(userId).replace(/[^a-fA-F0-9]/g, '');
    d = hex.length >= 4 ? hex.slice(-4).toLowerCase() : String(userId).slice(-4).toLowerCase();
  }
  if (!d) return null;
  const y = birthYear(dob) || '0000';
  return d + y + '6666';
}

// Hash passcode using scrypt with random salt
export function hashPasscode(passcode: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(passcode), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Verify passcode against scrypt or sha256 formatted hash
export function verifyPasscodeHash(passcode: string, stored: string): boolean {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  try {
    if (parts.length === 3 && parts[0] === 'sha256') {
      const computed = crypto.createHash('sha256').update(parts[1] + String(passcode)).digest('hex');
      return computed === parts[2];
    }
    if (parts.length === 2) {
      const computed = crypto.scryptSync(String(passcode), parts[0], 64);
      const storedHash = Buffer.from(parts[1], 'hex');
      return computed.length === storedHash.length && crypto.timingSafeEqual(computed, storedHash);
    }
  } catch (_) {}
  return false;
}

