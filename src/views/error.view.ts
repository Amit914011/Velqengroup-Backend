import { Response } from 'express';

export interface PbErrorResponse {
  code: number;
  message: string;
  data: Record<string, any>;
}

// PocketBase-compliant error response helper
export function sendPbError(
  res: Response,
  code: number,
  message: string,
  data: Record<string, any> = {}
): void {
  const payload: PbErrorResponse = {
    code,
    message,
    data,
  };
  res.status(code).json(payload);
}

