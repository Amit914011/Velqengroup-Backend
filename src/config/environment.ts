import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Startup validation of critical required variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is missing. Server refused to start without it.');
}

export const PORT = parseInt(process.env.PORT || '8091', 10);
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velqen?directConnection=true';
export const JWT_SECRET = process.env.JWT_SECRET;
export const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
export const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
export const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminPassword123!';
export const DEV_DEFAULT_PASSWORD = process.env.DEV_DEFAULT_PASSWORD || 'DevPassword123!';
export const PB_STORAGE_DIR = process.env.PB_STORAGE_DIR || '../pocketbase/pb_data/storage';
export const RECEPTION_EMAILS = process.env.RECEPTION_EMAILS || 'reception@velqengroup.com,receiption@velqengroup.com';
export const CORS_ORIGINS = process.env.CORS_ORIGINS || '';
export const TRUST_PROXY = process.env.TRUST_PROXY || 'false';
