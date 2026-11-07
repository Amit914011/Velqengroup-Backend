import { Request, Response } from 'express';
import path from 'path';
import {
  isSafePathSegment,
  generateFileToken,
  verifyFileToken,
  resolveFilePath,
} from '../services/storage.service.js';
import { ALL_MODELS } from '../models/index.js';
import { COLLECTION_ID_TO_NAME } from '../config/collections.js';
import { loadRules } from '../utils/rules/ruleLoader.js';
import { RuleEngine } from '../utils/rules/index.js';
import { sendPbError } from '../views/error.view.js';

// MIME map for static file serving
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

// Check if collection view rule requires authorization
function isViewRuleProtected(rule?: string | null): boolean {
  if (rule === '' || rule === '""') return false;
  return true;
}

// POST /api/files/token - generate short-lived file token
export function requestFileToken(req: Request, res: Response): void {
  const auth = (req as any).auth;
  if (!auth || (!auth.id && !auth._id)) {
    sendPbError(res, 401, 'The request requires valid authorization token.');
    return;
  }
  const token = generateFileToken(auth);
  res.json({ token });
}

// GET /api/files/:collection/:recordId/:filename - serve protected or public file
export async function serveFile(req: Request, res: Response): Promise<void> {
  const { collection, recordId, filename } = req.params;

  if (!isSafePathSegment(collection) || !isSafePathSegment(recordId) || !isSafePathSegment(filename)) {
    sendPbError(res, 400, 'Invalid path parameters or path traversal attempt.');
    return;
  }

  const colName = COLLECTION_ID_TO_NAME[collection] || collection;
  const filePath = resolveFilePath(colName, recordId, filename);
  if (!filePath) {
    sendPbError(res, 404, "The requested file wasn't found.");
    return;
  }

  const allRules = loadRules();
  const rules = allRules[colName];
  if (rules && isViewRuleProtected(rules.viewRule)) {
    let authUser = (req as any).auth;
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    if (!authUser && token) {
      authUser = verifyFileToken(token);
    }

    if (!authUser) {
      sendPbError(res, 403, 'You do not have permission to access the requested file.');
      return;
    }

    const model = ALL_MODELS[colName];
    if (model) {
      const { allowed, mongoFilter } = await RuleEngine.compileAccessFilter(
        'view',
        colName,
        model,
        { auth: authUser, method: 'GET' }
      );
      if (!allowed) {
        sendPbError(res, 403, 'You do not have permission to access the requested file.');
        return;
      }
      const query = Object.keys(mongoFilter).length === 0
        ? { _id: recordId }
        : { $and: [{ _id: recordId }, mongoFilter] };
      const record = await model.findOne(query).lean();
      if (!record) {
        sendPbError(res, 404, "The requested resource wasn't found.");
        return;
      }
    }
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.sendFile(filePath);
}
