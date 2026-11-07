import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { JWT_SECRET, PB_STORAGE_DIR } from '../config/environment.js';
import { COLLECTION_NAME_TO_ID } from '../config/collections.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORAGE_DIR = path.resolve(__dirname, '../../storage');

// Verify a string is a safe single path segment (prevents path traversal)
export function isSafePathSegment(segment: string): boolean {
  if (!segment || typeof segment !== 'string') return false;
  if (segment.includes('..') || segment.includes('/') || segment.includes('\\')) return false;
  if (/[\x00-\x1f\x7f]/.test(segment)) return false;
  return true;
}

// Generate PocketBase-compatible obfuscated filename
export function generatePbFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const rand1 = crypto.randomBytes(6).toString('hex');
  const rand2 = crypto.randomBytes(6).toString('hex');
  return `${rand1}_${rand2}${ext}`;
}

// Generate short-lived token for protected file downloads
export function generateFileToken(user: any): string {
  return jwt.sign(
    { id: user.id || user._id, role: user.role || '', collectionId: user.collectionId, type: 'file_token' },
    JWT_SECRET,
    { expiresIn: '120s' }
  );
}

// Verify short-lived file download token
export function verifyFileToken(token: string): any {
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.type === 'file_token' ? decoded : null;
  } catch (_) {
    return null;
  }
}

// Locate file on disk checking server storage then PocketBase fallback
export function resolveFilePath(collectionNameOrId: string, recordId: string, filename: string): string | null {
  if (!isSafePathSegment(collectionNameOrId) || !isSafePathSegment(recordId) || !isSafePathSegment(filename)) {
    return null;
  }
  const colId = COLLECTION_NAME_TO_ID[collectionNameOrId] || collectionNameOrId;

  const localPath = path.join(LOCAL_STORAGE_DIR, colId, recordId, filename);
  if (fs.existsSync(localPath)) return localPath;

  const pbPath = path.resolve(process.cwd(), PB_STORAGE_DIR, colId, recordId, filename);
  if (fs.existsSync(pbPath)) return pbPath;

  return null;
}

// Save uploaded file buffer to disk under storage/<colId>/<recordId>/<filename>
export async function saveUploadedFile(
  collection: string,
  recordId: string,
  originalName: string,
  buffer: Buffer
): Promise<string> {
  const colId = COLLECTION_NAME_TO_ID[collection] || collection;
  const fileName = generatePbFileName(originalName);
  const targetDir = path.join(LOCAL_STORAGE_DIR, colId, recordId);
  await fs.promises.mkdir(targetDir, { recursive: true });
  await fs.promises.writeFile(path.join(targetDir, fileName), buffer);
  return fileName;
}

// Delete file on disk when record or field is removed
export async function deleteStoredFile(collection: string, recordId: string, filename: string): Promise<void> {
  const filePath = resolveFilePath(collection, recordId, filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (_) {}
  }
}

