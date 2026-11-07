import { Request, Response } from 'express';
import { CaDocumentsModel } from '../../models/ca_documents.js';
import { sendPbError } from '../../views/error.view.js';

function canAccessCaDocs(auth: any): boolean {
  if (auth.role === 'admin' || auth.isSuperuser || auth.role === 'ca' || auth.department === 'CA') return true;
  const p = auth.permissions || {};
  return !!p.viewReports;
}

export async function getCaDocuments(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canAccessCaDocs(auth)) {
    return sendPbError(res, 403, 'Access denied.');
  }

  try {
    const list = await CaDocumentsModel.find().sort({ created: -1 }).lean();
    res.json({ success: true, documents: list });
  } catch (err: any) {
    sendPbError(res, 500, err.message || 'Failed to fetch CA documents.');
  }
}

