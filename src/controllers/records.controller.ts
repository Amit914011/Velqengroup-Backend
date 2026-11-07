import { Request, Response } from 'express';
import { ALL_MODELS } from '../models/index.js';
import { RuleEngine } from '../utils/rules/index.js';
import { parseFilter } from '../utils/filter/index.js';
import { parseQueryOptions } from '../utils/queryOptions.js';
import { populateExpands } from '../utils/expands.js';
import { formatRecord } from '../views/record.view.js';
import { sendPbError } from '../views/error.view.js';
import { generatePbId } from '../utils/idGenerator.js';
import { isSaturdayLockActive } from './saturdaySpecial.controller.js';
import { dispatchBefore, dispatchAfter } from '../services/hookDispatcher.service.js';
import { processUploadedFiles, cleanupRecordFiles } from '../services/recordUpload.service.js';

function combineFilters(ruleFilter: any, clientFilter: any): any {
  const clauses: any[] = [];
  if (Object.keys(ruleFilter).length > 0) clauses.push(ruleFilter);
  if (Object.keys(clientFilter).length > 0) clauses.push(clientFilter);
  if (clauses.length === 0) return {};
  return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

function checkUserSecurityFields(col: string, id: string, updates: any, auth: any): boolean {
  if (col !== 'users') return true;
  const isAdmin = auth?.role === 'admin' || auth?.collectionName === '_superusers';
  if (isAdmin) return true;
  const isSelf = auth?.id && auth.id === id;
  const selfOk = new Set(['security_failed_attempts', 'security_locked_until', 'security_last_verified_at']);
  const secFields = ['security_passcode_hash', 'security_passcode_status', 'security_passcode_set_at',
    'security_passcode_reset_at', 'security_last_verified_at', 'security_failed_attempts', 'security_locked_until'];
  return !secFields.some(sf => sf in updates && (!isSelf || !selfOk.has(sf)));
}

// GET /api/collections/:collection/records
export async function listRecords(req: Request, res: Response): Promise<void> {
  try {
    const col = req.params.collection;
    const model = ALL_MODELS[col];
    if (!model) return sendPbError(res, 404, `Collection "${col}" not found.`);

    const opts = parseQueryOptions(req.query);
    if (!req.query.sort && opts.sort.created && !model.schema.path('created')) {
      delete opts.sort.created;
      opts.sort._id = -1;
    }
    for (const sortField of Object.keys(opts.sort)) {
      if (sortField !== '_id' && sortField !== 'id' && !model.schema.path(sortField)) {
        return sendPbError(res, 400, `Invalid sort field "${sortField}".`);
      }
    }
    const ruleCtx = { auth: (req as any).auth, query: req.query, method: 'GET' };
    const { allowed, mongoFilter: ruleFilter } = await RuleEngine.compileAccessFilter('list', col, model, ruleCtx);
    if (!allowed) return sendPbError(res, 403, 'Only superusers can access this action.');

    let clientFilter = {};
    if (typeof req.query.filter === 'string' && req.query.filter.trim()) {
      clientFilter = await parseFilter(req.query.filter, model, ruleCtx);
    }

    const query = combineFilters(ruleFilter, clientFilter);
    const totalItems = opts.skipTotal ? -1 : await model.countDocuments(query);
    const totalPages = opts.skipTotal ? -1 : Math.ceil(totalItems / opts.perPage);
    const skip = (opts.page - 1) * opts.perPage;
    let cursor = model.find(query);
    if (!opts.isRandomSort) cursor = cursor.sort(opts.sort);
    const rawDocs = await cursor.skip(skip).limit(opts.perPage).lean();

    const auth = (req as any).auth;
    const formatted = rawDocs.map((d: any) => formatRecord(d, col, opts.fields, auth));
    if (opts.expand?.length) await populateExpands(formatted, opts.expand, model);
    res.json({ page: opts.page, perPage: opts.perPage, totalItems, totalPages, items: formatted });
  } catch (err: any) {
    sendPbError(res, err.code || 400, err.message);
  }
}

// GET /api/collections/:collection/records/:id
export async function getRecord(req: Request, res: Response): Promise<void> {
  try {
    const col = req.params.collection;
    const id = req.params.id;
    const model = ALL_MODELS[col];
    if (!model) return sendPbError(res, 404, `Collection "${col}" not found.`);

    const opts = parseQueryOptions(req.query);
    const ruleCtx = { auth: (req as any).auth, query: req.query, method: 'GET' };
    const { allowed, mongoFilter } = await RuleEngine.compileAccessFilter('view', col, model, ruleCtx);
    if (!allowed) return sendPbError(res, 403, 'Only superusers can access this action.');

    const query = Object.keys(mongoFilter).length === 0 ? { _id: id } : { $and: [{ _id: id }, mongoFilter] };
    const doc: any = await model.findOne(query).lean();
    if (!doc) return sendPbError(res, 404, "The requested resource wasn't found.");

    const formatted = formatRecord(doc, col, opts.fields, (req as any).auth);
    if (opts.expand?.length) await populateExpands([formatted], opts.expand, model);
    res.json(formatted);
  } catch (err: any) {
    sendPbError(res, 500, err.message);
  }
}

// POST /api/collections/:collection/records
export async function createRecord(req: Request, res: Response): Promise<void> {
  try {
    const col = req.params.collection;
    const model = ALL_MODELS[col];
    if (!model) return sendPbError(res, 404, `Collection "${col}" not found.`);

    const ruleCtx = { auth: (req as any).auth, body: req.body, method: 'POST' };
    const allowed = await RuleEngine.evaluateWriteRule('create', col, model, ruleCtx);
    if (!allowed) return sendPbError(res, 403, 'Failed to create record. Rule violation.');

    if (await isSaturdayLockActive((req as any).auth, col)) {
      return sendPbError(res, 400, 'Saturday Fun Session is active. Employee Portal is temporarily locked.');
    }

    const initial = await dispatchBefore('beforeCreate', { collection: col, body: req.body || {}, auth: (req as any).auth });
    const recordId = initial.id || initial._id || generatePbId();
    delete initial.id;
    initial._id = recordId;

    const filePatches = await processUploadedFiles(col, recordId, req.files as Express.Multer.File[]);
    Object.assign(initial, filePatches);
    initial.created = initial.created ? new Date(initial.created) : new Date();
    initial.updated = initial.updated ? new Date(initial.updated) : new Date();

    const created = await model.create(initial);
    const obj = created.toObject();
    await dispatchAfter('afterCreate', { collection: col, record: obj, auth: (req as any).auth, body: initial });
    res.status(200).json(formatRecord(obj, col, undefined, (req as any).auth));
  } catch (err: any) {
    sendPbError(res, err.code || 400, err.message, err.data);
  }
}

// PATCH /api/collections/:collection/records/:id
export async function updateRecord(req: Request, res: Response): Promise<void> {
  try {
    const { collection: col, id } = req.params;
    const model = ALL_MODELS[col];
    if (!model) return sendPbError(res, 404, `Collection "${col}" not found.`);

    const existing: any = await model.findById(id);
    if (!existing) return sendPbError(res, 404, "The requested resource wasn't found.");

    const ruleCtx = { auth: (req as any).auth, body: req.body, record: existing.toObject(), method: 'PATCH' };
    const allowed = await RuleEngine.evaluateWriteRule('update', col, model, ruleCtx);
    if (!allowed) return sendPbError(res, 403, 'Failed to update record. Rule violation.');

    if (await isSaturdayLockActive((req as any).auth, col)) {
      return sendPbError(res, 400, 'Saturday Fun Session is active. Employee Portal is temporarily locked.');
    }

    const updates = await dispatchBefore('beforeUpdate', { collection: col, id, record: existing.toObject(), body: req.body || {}, auth: (req as any).auth });
    delete updates.id;
    delete updates._id;

    if (!checkUserSecurityFields(col, id, updates, (req as any).auth)) {
      return sendPbError(res, 403, 'Not allowed to modify security fields.');
    }

    const filePatches = await processUploadedFiles(col, id, req.files as Express.Multer.File[]);
    Object.assign(updates, filePatches);
    updates.updated = new Date();
    Object.assign(existing, updates);

    const updated = await existing.save();
    const obj = updated.toObject();
    await dispatchAfter('afterUpdate', { collection: col, record: obj, auth: (req as any).auth, body: updates });
    res.status(200).json(formatRecord(obj, col, undefined, (req as any).auth));
  } catch (err: any) {
    sendPbError(res, err.code || 400, err.message, err.data);
  }
}

// DELETE /api/collections/:collection/records/:id
export async function deleteRecord(req: Request, res: Response): Promise<void> {
  try {
    const { collection: col, id } = req.params;
    const model = ALL_MODELS[col];
    if (!model) return sendPbError(res, 404, `Collection "${col}" not found.`);

    const existing: any = await model.findById(id);
    if (!existing) return sendPbError(res, 404, "The requested resource wasn't found.");

    const ruleCtx = { auth: (req as any).auth, record: existing.toObject(), method: 'DELETE' };
    const allowed = await RuleEngine.evaluateWriteRule('delete', col, model, ruleCtx);
    if (!allowed) return sendPbError(res, 403, 'Failed to delete record. Rule violation.');

    if (await isSaturdayLockActive((req as any).auth, col)) {
      return sendPbError(res, 400, 'Saturday Fun Session is active. Employee Portal is temporarily locked.');
    }

    await dispatchBefore('beforeDelete', { collection: col, id, record: existing.toObject(), body: {}, auth: (req as any).auth });
    await model.deleteOne({ _id: id });
    await cleanupRecordFiles(col, id, existing.toObject());
    await dispatchAfter('afterDelete', { collection: col, record: existing.toObject(), auth: (req as any).auth });
    res.status(204).end();
  } catch (err: any) {
    sendPbError(res, err.code || 400, err.message, err.data);
  }
}
