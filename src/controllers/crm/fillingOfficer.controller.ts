import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  getFOClients,
  updateClientStatus,
  updateApplicationStatus,
  getClientDocs,
  createDocumentRequest,
  assignFOToClient,
  listAllFillingOfficers,
  getClientStatusHistory,
  getApplicationStatusHistory,
  assertClientAccess,
} from '../../services/crm/fillingOfficer.service.js';

export async function getClientsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const clients = await getFOClients(auth);
    res.json({ clients, count: clients.length });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function changeClientStatusAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { leadId, newStatus, remarks } = req.body || {};
  if (!leadId || !newStatus) return sendPbError(res, 400, 'leadId and newStatus are required.');

  try {
    const result = await updateClientStatus(auth, leadId, newStatus, remarks);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function changeApplicationStatusAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { leadId, newStatus, remarks } = req.body || {};
  if (!leadId || !newStatus) return sendPbError(res, 400, 'leadId and newStatus are required.');

  try {
    const result = await updateApplicationStatus(auth, leadId, newStatus, remarks);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getDocumentsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const leadId = String(req.query.leadId || '');
  if (!leadId) return sendPbError(res, 400, 'leadId is required.');

  try {
    const result = await getClientDocs(auth, leadId);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function requestDocumentsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { leadId, title } = req.body || {};
  if (!leadId || !title) return sendPbError(res, 400, 'leadId and title are required.');

  try {
    const result = await createDocumentRequest(auth, leadId, req.body);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function allocateFOAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (auth.role !== 'admin' && !auth.isSuperuser) return sendPbError(res, 403, 'Admin access required.');

  const { leadId, foId, foName } = req.body || {};
  if (!leadId || !foId) return sendPbError(res, 400, 'leadId and foId are required.');

  try {
    const result = await assignFOToClient(auth, leadId, foId, foName || '');
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function listFOsAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  try {
    const fos = await listAllFillingOfficers();
    res.json({ fillingOfficers: fos });
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

export async function getClientStatusHistoryAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const leadId = req.params.leadId;
  try {
    const history = await getClientStatusHistory(auth, leadId);
    res.json({ history, count: history.length });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function getApplicationStatusHistoryAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const leadId = req.params.leadId;
  try {
    const history = await getApplicationStatusHistory(auth, leadId);
    res.json({ history, count: history.length });
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function assertClientAccessAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const leadId = req.body?.leadId || req.query?.leadId;
  if (!leadId) return sendPbError(res, 400, 'leadId is required.');
  try {
    const result = await assertClientAccess(auth, String(leadId));
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

