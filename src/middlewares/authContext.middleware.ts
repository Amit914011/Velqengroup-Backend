import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, decodeTokenUnverified } from '../utils/jwt.js';
import { COLLECTION_ID_TO_NAME } from '../config/collections.js';
import { ALL_MODELS } from '../models/index.js';
import { resolveRole } from '../services/roles.service.js';

const userCache = new Map<string, { doc: any; expiry: number }>();

function cleanTokenHeader(header: string): string {
  let token = header.trim();
  if (/^Bearer\s+/i.test(token)) {
    token = token.replace(/^Bearer\s+/i, '').trim();
  }
  try {
    const decodedB64 = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (decodedB64?.token) token = decodedB64.token;
  } catch (_) {}
  return token;
}

async function getCachedUser(model: any, id: string): Promise<any> {
  const cached = userCache.get(id);
  if (cached && cached.expiry > Date.now()) return cached.doc;

  try {
    const doc = await model.findById(id).lean();
    if (doc) {
      if (userCache.size > 50) userCache.clear();
      userCache.set(id, { doc, expiry: Date.now() + 60000 });
      return doc;
    }
  } catch (_) {}
  return null;
}

// Extract auth token and attach user session to req.auth
export async function authContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    (req as any).auth = null;
    return next();
  }

  const token = cleanTokenHeader(authHeader);
  const payload = verifyAuthToken(token) || decodeTokenUnverified(token);
  if (!payload?.id) {
    (req as any).auth = null;
    return next();
  }

  const colName = payload.collectionName || COLLECTION_ID_TO_NAME[payload.collectionId] || 'users';
  const model = ALL_MODELS[colName];

  if (model) {
    const userDoc = await getCachedUser(model, payload.id);
    if (userDoc) {
      const authUser = {
        id: String(userDoc._id),
        role: userDoc.role || (colName === '_superusers' ? 'admin' : ''),
        email: userDoc.email || '',
        department: userDoc.department || '',
        designation: userDoc.designation || '',
        collectionId: payload.collectionId,
        collectionName: colName,
        ...userDoc,
      };
      (authUser as any).resolvedRole = resolveRole(authUser);
      (req as any).auth = authUser;
      return next();
    }
  }

  (req as any).auth = {
    id: payload.id,
    role: colName === '_superusers' ? 'admin' : '',
    collectionId: payload.collectionId,
    collectionName: colName,
  };
  next();
}
