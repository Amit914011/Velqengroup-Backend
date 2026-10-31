import path from 'path';
import dotenv from 'dotenv';
import { RoleCred } from './types.js';
import { safeFetch } from './http.js';

// Load .env.test with fallback to parent paths
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/server/.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
export const SERVER_URL = process.env.SERVER_URL || 'http://127.0.0.1:8091';

const DEFAULT_SERVER_PASS = process.env.SERVER_DEFAULT_PASSWORD || 'DevPassword123!';

export const ROLES: RoleCred[] = [
  {
    role: 'superuser',
    col: '_superusers',
    email: process.env.PB_SUPERUSER_EMAIL || 'admin@example.com',
    pbPass: process.env.PB_SUPERUSER_PASSWORD || 'AdminPassword123!',
    srvPass: process.env.PB_SUPERUSER_PASSWORD || 'AdminPassword123!',
  },
  {
    role: 'admin',
    col: 'users',
    email: process.env.PB_ADMIN_EMAIL || 'admin@velqengroup.com',
    pbPass: process.env.PB_ADMIN_PASSWORD || 'velqenadmin1',
    srvPass: DEFAULT_SERVER_PASS,
  },
  {
    role: 'employee',
    col: 'users',
    email: process.env.PB_EMPLOYEE_EMAIL || 'emp@velqen.com',
    pbPass: process.env.PB_EMPLOYEE_PASSWORD || 'Emp123!',
    srvPass: DEFAULT_SERVER_PASS,
  },
  {
    role: 'ca',
    col: 'users',
    email: process.env.PB_CA_EMAIL || 'ca@velqengroup.com',
    pbPass: process.env.PB_CA_PASSWORD || 'CA@123456',
    srvPass: DEFAULT_SERVER_PASS,
  },
  {
    role: 'client',
    col: 'users',
    email: process.env.PB_CLIENT_EMAIL || 'client@velqengroup.com',
    pbPass: process.env.PB_CLIENT_PASSWORD || 'velqenclient1',
    srvPass: DEFAULT_SERVER_PASS,
  },
  {
    role: 'reception',
    col: 'users',
    email: process.env.PB_RECEPTION_EMAIL || 'reception@velqengroup.com',
    pbPass: process.env.PB_RECEPTION_PASSWORD || 'Reception@123',
    srvPass: DEFAULT_SERVER_PASS,
  },
  {
    role: 'anonymous',
    col: '',
    email: '',
    pbPass: '',
    srvPass: '',
  },
];

async function authenticateRole(
  baseUrl: string,
  cred: RoleCred,
  isServer: boolean
): Promise<{ token: string; id: string }> {
  if (cred.role === 'anonymous') return { token: '', id: '' };
  const password = isServer ? cred.srvPass : cred.pbPass;
  const endpoint = `${baseUrl}/api/collections/${cred.col}/auth-with-password`;

  const res = await safeFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: cred.email, password }),
  });

  const token = res.status === 200 && res.data?.token ? res.data.token : '';
  const id = res.data?.record?.id || '';
  return { token, id };
}

// Authenticate all configured roles and report missing credentials
export async function setupAuth(): Promise<{
  pbTokens: Map<string, string>;
  srvTokens: Map<string, string>;
  activeRoles: string[];
}> {
  const pbTokens = new Map<string, string>();
  const srvTokens = new Map<string, string>();
  const activeRoles: string[] = [];
  const pbUserIds: string[] = [];

  for (const cred of ROLES) {
    if (cred.role === 'anonymous') {
      activeRoles.push('anonymous');
      continue;
    }
    const [pbRes, srvRes] = await Promise.all([
      authenticateRole(PB_URL, cred, false),
      authenticateRole(SERVER_URL, cred, true),
    ]);

    if (pbRes.token) {
      pbTokens.set(cred.role, pbRes.token);
      if (pbRes.id) pbUserIds.push(pbRes.id);
    }
    if (srvRes.token) srvTokens.set(cred.role, srvRes.token);

    if (pbRes.token || srvRes.token) {
      activeRoles.push(cred.role);
    } else {
      console.warn(`[AUTH] Missing / invalid credentials for role: ${cred.role}`);
    }
  }

  // Ensure security sessions in PocketBase so hook doesn't false-block employee/reception
  const superPb = pbTokens.get('superuser');
  if (superPb) {
    for (const uid of pbUserIds) {
      await safeFetch(`${PB_URL}/api/collections/security_sessions/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: superPb,
        },
        body: JSON.stringify({
          user: uid,
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        }),
      });
    }
  }

  return { pbTokens, srvTokens, activeRoles };
}

