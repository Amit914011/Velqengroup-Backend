import { Request, Response } from 'express';
import fs from 'fs';
import { UsersModel } from '../../models/users.js';
import { EmployeeDocumentsModel } from '../../models/employee_documents.js';
import { sendPbError } from '../../views/error.view.js';
import { canSubmitEmployeeChanges } from '../../services/hr/employeeChange.service.js';
import { saveUploadedFile, resolveFilePath } from '../../services/storage.service.js';
import { generatePbId } from '../../utils/idGenerator.js';

export async function uploadIdentityFiles(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canSubmitEmployeeChanges(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { employeeId } = req.body || {};
  const target = await UsersModel.findById(employeeId);
  if (!target) return sendPbError(res, 404, 'Employee not found.');
  if (auth.role !== 'admin' && target.manager !== auth._id) {
    return sendPbError(res, 403, 'This employee is not assigned to you.');
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const f of files) {
    const field = f.fieldname;
    if (['aadharFile', 'panFile', 'bankFile'].includes(field)) {
      if ((target as any)[field]) {
        skipped.push(field);
      } else {
        const savedName = await saveUploadedFile('users', target._id, f.originalname, f.buffer);
        (target as any)[field] = savedName;
        applied.push(field);
      }
    }
  }

  if (applied.length > 0) await target.save();
  res.json({ success: true, applied, skipped });
}

export async function getEmployeeDocuments(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  const employeeId = String(req.query.employeeId || '');
  if (!employeeId) return sendPbError(res, 400, 'employeeId is required.');

  const target = await UsersModel.findById(employeeId);
  if (!target) return sendPbError(res, 404, 'Employee not found.');
  if (auth.role !== 'admin' && target.manager !== auth._id && auth._id !== employeeId) {
    return sendPbError(res, 403, 'Access denied.');
  }

  const docs = await EmployeeDocumentsModel.find({ employee: employeeId }).sort({ created: -1 }).lean();
  res.json({ success: true, documents: docs });
}

export async function uploadEmployeeDocument(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');
  if (!canSubmitEmployeeChanges(auth)) return sendPbError(res, 403, 'Permission denied.');

  const { employeeId, documentType, notes } = req.body || {};
  const target = await UsersModel.findById(employeeId);
  if (!target) return sendPbError(res, 404, 'Employee not found.');
  if (auth.role !== 'admin' && target.manager !== auth._id) {
    return sendPbError(res, 403, 'This employee is not assigned to you.');
  }

  const file = (req.files as Express.Multer.File[])?.[0];
  if (!file) return sendPbError(res, 400, 'A document file is required.');

  const docId = generatePbId();
  const savedName = await saveUploadedFile('employee_documents', docId, file.originalname, file.buffer);

  const doc = await EmployeeDocumentsModel.create({
    _id: docId,
    employee: employeeId,
    documentType: documentType || 'Other Document',
    documentName: file.originalname,
    file: savedName,
    fileSize: file.size,
    fileType: file.mimetype,
    notes: String(notes || '').slice(0, 1000),
    uploadedBy: auth._id,
    uploadedByName: `${auth.name || auth.email} (Manager)`,
  });

  res.json({ success: true, document: doc.toObject() });
}

export async function streamDocumentFile(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const doc = await EmployeeDocumentsModel.findById(req.params.id);
  if (!doc) return sendPbError(res, 404, 'Document not found.');

  const target = await UsersModel.findById(doc.employee);
  if (auth.role !== 'admin' && target?.manager !== auth._id && auth._id !== doc.employee) {
    return sendPbError(res, 403, 'Access denied.');
  }

  const filePath = resolveFilePath('employee_documents', doc._id, doc.file || '');
  if (!filePath || !fs.existsSync(filePath)) return sendPbError(res, 404, 'File not found on disk.');

  res.setHeader('Content-Type', doc.fileType || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

export async function streamIdentityFile(req: Request, res: Response): Promise<void> {
  const auth = (req as any).auth;
  if (!auth) return sendPbError(res, 401, 'Login required.');

  const employeeId = String(req.query.employeeId || '');
  const field = String(req.query.field || '');
  if (!['aadharFile', 'panFile', 'bankFile'].includes(field)) {
    return sendPbError(res, 400, 'field must be aadharFile, panFile, or bankFile.');
  }

  const target = await UsersModel.findById(employeeId);
  if (!target) return sendPbError(res, 404, 'Employee not found.');
  if (auth.role !== 'admin' && target.manager !== auth._id && auth._id !== employeeId) {
    return sendPbError(res, 403, 'Access denied.');
  }

  const fileName = (target as any)[field];
  if (!fileName) return sendPbError(res, 404, `No file uploaded for ${field}.`);

  const filePath = resolveFilePath('users', target._id, fileName);
  if (!filePath || !fs.existsSync(filePath)) return sendPbError(res, 404, 'File not found on disk.');

  res.setHeader('Content-Type', 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}
