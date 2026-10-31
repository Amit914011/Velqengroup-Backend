import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/environment.js';

export interface AuthTokenPayload {
  id: string;
  type: string;
  collectionId: string;
  collectionName?: string;
  iat?: number;
  exp?: number;
}

// PocketBase default token lifetimes
export const PB_AUTH_TOKEN_LIFETIME = '14d'; // 14 days (1209600s)
export const PB_RESET_TOKEN_LIFETIME = '30m'; // 30 minutes (1800s)

// Sign a standard PocketBase JWT token
export function signAuthToken(
  user: { _id?: string; id?: string },
  collectionId: string,
  collectionName?: string
): string {
  const userId = String(user._id || user.id);
  const payload: AuthTokenPayload = {
    id: userId,
    type: 'auth',
    collectionId,
    collectionName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: PB_AUTH_TOKEN_LIFETIME });
}

// Sign a password reset or verification token
export function signResetToken(
  user: { _id?: string; id?: string },
  collectionId: string
): string {
  const userId = String(user._id || user.id);
  const payload: AuthTokenPayload = {
    id: userId,
    type: 'reset',
    collectionId,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: PB_RESET_TOKEN_LIFETIME });
}

// Verify signature and return payload or null
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return jwt.verify(cleanToken, JWT_SECRET) as AuthTokenPayload;
  } catch (_) {
    return null;
  }
}

// Decode without verification (used during transitional PB token checks)
export function decodeTokenUnverified(token: string): AuthTokenPayload | null {
  try {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return jwt.decode(cleanToken) as AuthTokenPayload;
  } catch (_) {
    return null;
  }
}

