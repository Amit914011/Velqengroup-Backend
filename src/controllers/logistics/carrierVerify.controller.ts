import { Request, Response } from 'express';
import { existsSync, rmSync } from 'node:fs';
import { FmcsaImportsModel } from '../../models/fmcsa_imports.js';
import { FmcsaCarriersModel } from '../../models/fmcsa_carriers.js';
import {
  parseQuery, findByDot, findByDocket, findByDocketNumberAny, findByName,
  explainSearch, getDatasetInfo, streamImportCsv, buildCarrierPayload,
} from '../../services/logistics/carrier.service.js';
import { normalizeCarrier, matchSummary, notFound, str } from '../../services/logistics/carrierNormalizer.js';
import { getCarrierReputation } from '../../services/logistics/reputation.service.js';
import { parseFmcsaPdf } from '../../services/logistics/fmcsaPdf.service.js';
import { sendPbError } from '../../views/error.view.js';

export async function getStatus(_req: Request, res: Response): Promise<void> {
  const { recordCount, lastImportDate } = await getDatasetInfo();
  res.json({ provider: 'Imported FMCSA Dataset', health: recordCount > 0 ? 'online' : 'empty', recordCount, datasetImportDate: lastImportDate });
}

export async function getDataset(_req: Request, res: Response): Promise<void> {
  const { recordCount, lastImportDate } = await getDatasetInfo();
  const imports = await FmcsaImportsModel.find().sort({ created: -1 }).limit(10).lean();
  res.json({ recordCount, lastImportDate, imports });
}

export async function getImports(_req: Request, res: Response): Promise<void> {
  const items = await FmcsaImportsModel.find().sort({ created: -1 }).limit(50).lean();
  res.json({ items });
}

export async function deleteImport(req: Request, res: Response): Promise<void> {
  await FmcsaImportsModel.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
}

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;
const lookupHits = new Map<string, number[]>();

function isLookupRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (lookupHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  lookupHits.set(ip, arr);
  return arr.length > RATE_MAX;
}

export async function lookup(req: Request, res: Response): Promise<void> {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  if (isLookupRateLimited(ip)) {
    return sendPbError(res, 429, 'Too many carrier lookups. Please slow down and try again shortly.');
  }

  const qStr = str(req.query.q);
  const parsed = parseQuery(qStr);
  if (!parsed) return sendPbError(res, 422, 'A search query (MC, USDOT or carrier name) is required.');

  const { recordCount, lastImportDate } = await getDatasetInfo();
  if (recordCount === 0) {
    res.json({ found: false, empty: true, query: qStr, provider: 'Imported FMCSA Dataset', message: 'FMCSA dataset is empty.' });
    return;
  }

  if (parsed.kind === 'dot') {
    const rec = await findByDot(parsed.number!);
    return void res.json(rec ? normalizeCarrier(rec, lastImportDate, qStr) : notFound(qStr));
  }
  if (parsed.kind === 'docket') {
    const rows = await findByDocket(parsed.prefix!, parsed.number!);
    if (rows.length === 1) return void res.json(normalizeCarrier(rows[0], lastImportDate, qStr));
    if (rows.length > 1) return void res.json({ found: false, multiple: true, query: qStr, results: rows.map(matchSummary) });
    return void res.json(notFound(qStr));
  }
  if (parsed.kind === 'number') {
    const dotRec = await findByDot(parsed.number!);
    const docketRows = await findByDocketNumberAny(parsed.number!);
    const all = dotRec ? [dotRec, ...docketRows.filter(r => r._id !== dotRec._id)] : docketRows;
    if (all.length === 1) return void res.json(normalizeCarrier(all[0], lastImportDate, qStr));
    if (all.length > 1) return void res.json({ found: false, multiple: true, query: qStr, results: all.map(matchSummary) });
    return void res.json(notFound(qStr));
  }
  const nameRows = await findByName(parsed.value!);
  if (nameRows.length === 1) return void res.json(normalizeCarrier(nameRows[0], lastImportDate, qStr));
  if (nameRows.length > 1) return void res.json({ found: false, multiple: true, query: qStr, results: nameRows.map(matchSummary) });
  res.json(notFound(qStr));
}

export async function explainLookup(req: Request, res: Response): Promise<void> {
  const dot = str(req.query.dot || req.query.q || '123456');
  const plan = await explainSearch(dot);
  res.json({ dot, plan });
}

export async function importDataset(req: Request, res: Response): Promise<void> {
  if (!req.file) return sendPbError(res, 400, 'No CSV file uploaded.');
  const mode = str(req.body.mode || 'import').toLowerCase() === 'validate' ? 'validate' : 'import';
  const adminName = (req as any).auth?.name || (req as any).auth?.email || 'admin';
  try {
    const result = await streamImportCsv(req.file.path, req.file.originalname, req.file.size, mode, adminName);
    if (existsSync(req.file.path)) rmSync(req.file.path, { force: true });
    res.json(result);
  } catch (err: any) {
    if (existsSync(req.file.path)) rmSync(req.file.path, { force: true });
    sendPbError(res, 500, err.message || 'Import failed');
  }
}

export async function importPdf(req: Request, res: Response): Promise<void> {
  if (!req.file) return sendPbError(res, 400, 'No PDF file uploaded.');
  const mode = str(req.body.mode || 'import').toLowerCase() === 'validate' ? 'validate' : 'import';
  const importDate = new Date().toISOString();
  try {
    const parsed = await parseFmcsaPdf(req.file.path);
    if (mode === 'import') {
      for (const row of parsed.rows) {
        const payload = buildCarrierPayload(row, req.file.originalname, importDate);
        await FmcsaCarriersModel.updateOne({ dotNumber: row.dot_number }, { $set: payload }, { upsert: true });
      }
    }
    if (existsSync(req.file.path)) rmSync(req.file.path, { force: true });
    res.json({ ok: true, mode, pagesParsed: parsed.pages, rowsProcessed: parsed.rows.length, status: mode === 'validate' ? 'Validated' : 'Completed' });
  } catch (err: any) {
    if (existsSync(req.file.path)) rmSync(req.file.path, { force: true });
    sendPbError(res, 500, err.message || 'PDF import failed');
  }
}

export async function getReputationStatus(_req: Request, res: Response): Promise<void> {
  const configured = Boolean(process.env.GOOGLE_PLACES_API_KEY);
  res.json({ configured, ok: configured, code: configured ? 'OK' : 'API_KEY_MISSING' });
}

export async function getReputation(req: Request, res: Response): Promise<void> {
  const b = req.body || {};
  const bypass = Boolean(b.bypassCache || req.query.refresh === 'true');
  const result = await getCarrierReputation(b, bypass);
  if (result.errorResponse) {
    res.status(result.errorResponse.code).json(result.errorResponse);
    return;
  }
  res.json(result);
}
