import { Request, Response } from 'express';
import { sendPbError } from '../../views/error.view.js';
import {
  submitSmileInquiry,
  logSmileDonor,
  submitHelpRequest,
  registerVolunteer,
  reviewVolunteer,
} from '../../services/public/smile.service.js';

export async function submitSmileInquiryAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await submitSmileInquiry(req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function logSmileDonorAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await logSmileDonor(req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function submitHelpRequestAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await submitHelpRequest(req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function registerVolunteerAction(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerVolunteer(req.body || {});
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

export async function reviewVolunteerAction(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const { id } = req.params;
  const { status, notes } = req.body || {};
  if (!status || !['approved', 'rejected'].includes(status)) {
    return sendPbError(res, 400, 'Valid status (approved/rejected) required.');
  }

  try {
    const result = await reviewVolunteer(auth, id, status, notes);
    res.json(result);
  } catch (err: any) {
    sendPbError(res, 400, err.message);
  }
}

