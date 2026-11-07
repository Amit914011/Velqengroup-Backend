import { createReadStream } from 'node:fs';
import readline from 'node:readline';
import { FmcsaCarriersModel } from '../../models/fmcsa_carriers.js';
import { FmcsaImportsModel } from '../../models/fmcsa_imports.js';
import { generatePbId } from '../../utils/idGenerator.js';
import { str, num, buildCargoCategories } from './carrierNormalizer.js';

function sanitizeCell(v: any): string {
  const s = str(v);
  return /^[=+@]/.test(s) ? `'${s}` : s;
}

export function parseQuery(raw: any): { kind: string; number?: string; prefix?: string; value?: string } | null {
  const q = str(raw);
  if (!q) return null;
  const m = q.match(/^(MC|MX|FF)[-\s]?(\d{1,8})$/i);
  if (m) return { kind: 'docket', prefix: m[1].toUpperCase(), number: m[2] };
  const d = q.match(/^(?:USDOT|DOT)[-\s]?(\d{1,8})$/i);
  if (d) return { kind: 'dot', number: d[1] };
  const n = q.match(/^(\d{1,8})$/);
  if (n) return { kind: 'number', number: n[1] };
  return { kind: 'name', value: q };
}

export async function findByDot(dot: string): Promise<any> {
  return FmcsaCarriersModel.findOne({ dotNumber: dot }).lean();
}

export async function findByDocket(prefix: string, number: string): Promise<any[]> {
  return FmcsaCarriersModel.find({
    $or: [{ docket1Prefix: prefix, docket1: number }, { docket2Prefix: prefix, docket2: number }, { docket3Prefix: prefix, docket3: number }],
  }).lean();
}

export async function findByDocketNumberAny(number: string): Promise<any[]> {
  return FmcsaCarriersModel.find({ $or: [{ docket1: number }, { docket2: number }, { docket3: number }] }).lean();
}

export async function findByName(value: string): Promise<any[]> {
  const esc = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exact = await FmcsaCarriersModel.find({
    $or: [
      { legalName: { $regex: new RegExp(`^${esc}$`, 'i') } },
      { dbaName: { $regex: new RegExp(`^${esc}$`, 'i') } },
    ],
  }).limit(25).lean();
  if (exact.length > 0) return exact;

  return FmcsaCarriersModel.find({
    $or: [
      { legalName: { $regex: new RegExp(esc, 'i') } },
      { dbaName: { $regex: new RegExp(esc, 'i') } },
    ],
  }).limit(25).lean();
}

export async function explainSearch(dotNumber: string): Promise<any> {
  return FmcsaCarriersModel.find({ dotNumber }).explain('executionStats');
}

export async function getDatasetInfo(): Promise<{ recordCount: number; lastImportDate: string; importId: string }> {
  let recordCount = 0;
  let lastImportDate = '';
  let importId = '';
  try {
    recordCount = await FmcsaCarriersModel.countDocuments();
    const last = await FmcsaImportsModel.findOne({ status: 'Completed' }).sort({ created: -1 }).lean();
    if (last) {
      lastImportDate = last.importDate || last.created?.toISOString() || '';
      importId = last._id;
    }
  } catch (_) {}
  return { recordCount, lastImportDate, importId };
}

export function buildCarrierPayload(row: Record<string, any>, sourceFile: string, importDate: string): any {
  const cargo = buildCargoCategories(row);
  return {
    dotNumber: str(row.dot_number || row.dotNumber),
    statusCode: str(row.status_code || row.statusCode),
    docket1Prefix: str(row.docket1prefix || row.docket1Prefix),
    docket1: str(row.docket1),
    docket1Status: str(row.docket1_status_code || row.docket1Status),
    docket2Prefix: str(row.docket2prefix || row.docket2Prefix),
    docket2: str(row.docket2),
    docket2Status: str(row.docket2_status_code || row.docket2Status),
    docket3Prefix: str(row.docket3prefix || row.docket3Prefix),
    docket3: str(row.docket3),
    docket3Status: str(row.docket3_status_code || row.docket3Status),
    legalName: sanitizeCell(row.legal_name || row.legalName),
    dbaName: sanitizeCell(row.dba_name || row.dbaName),
    phyStreet: sanitizeCell(row.phy_street || row.phyStreet),
    phyCity: str(row.phy_city || row.phyCity),
    phyState: str(row.phy_state || row.phyState),
    phyZip: str(row.phy_zip || row.phyZip),
    phyCountry: str(row.phy_country || row.phyCountry),
    phyCnty: str(row.phy_cnty || row.phyCnty),
    mailStreet: sanitizeCell(row.carrier_mailing_street || row.mailStreet),
    mailCity: str(row.carrier_mailing_city || row.mailCity),
    mailState: str(row.carrier_mailing_state || row.mailState),
    mailZip: str(row.carrier_mailing_zip || row.mailZip),
    mailCountry: str(row.carrier_mailing_country || row.mailCountry),
    phone: str(row.phone),
    cellPhone: str(row.cell_phone || row.cellPhone),
    fax: str(row.fax),
    email: str(row.email_address || row.email),
    businessOrgDesc: str(row.business_org_desc || row.businessOrgDesc),
    companyOfficer1: sanitizeCell(row.company_officer_1 || row.companyOfficer1),
    companyOfficer2: sanitizeCell(row.company_officer_2 || row.companyOfficer2),
    carrierOperation: str(row.carrier_operation || row.carrierOperation),
    classdef: str(row.classdef),
    truckUnits: num(row.truck_units || row.truckUnits),
    powerUnits: num(row.power_units || row.powerUnits),
    busUnits: num(row.bus_units || row.busUnits),
    fleetSize: num(row.fleetsize || row.fleetSize),
    totalDrivers: num(row.total_drivers || row.totalDrivers),
    totalCdl: num(row.total_cdl || row.totalCdl),
    driverInterTotal: num(row.driver_inter_total || row.driverInterTotal),
    totalIntrastateDrivers: num(row.total_intrastate_drivers || row.totalIntrastateDrivers),
    mcs150Date: str(row.mcs150_date || row.mcs150Date),
    mcs150Mileage: num(row.mcs150_mileage || row.mcs150Mileage),
    mcs150MileageYear: str(row.mcs150_mileage_year || row.mcs150MileageYear),
    hmInd: str(row.hm_ind || row.hmInd),
    priorRevokeFlag: str(row.prior_revoke_flag || row.priorRevokeFlag),
    priorRevokeDotNumber: str(row.prior_revoke_dot_number || row.priorRevokeDotNumber),
    reviewId: str(row.review_id || row.reviewId),
    reviewType: str(row.review_type || row.reviewType),
    reviewDate: str(row.review_date || row.reviewDate),
    safetyRating: str(row.safety_rating || row.safetyRating),
    safetyRatingDate: str(row.safety_rating_date || row.safetyRatingDate),
    undelivPhy: str(row.undeliv_phy || row.undelivPhy),
    cargoCategories: cargo.categories,
    cargoOtherDesc: str(row.crgo_cargoothr_desc || row.cargoOtherDesc),
    rawData: row,
    sourceFile,
    sourceImportDate: importDate,
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  result.push(cur.trim());
  return result;
}

export async function streamImportCsv(filePath: string, fileName: string, fileSize: number, mode: 'validate' | 'import', adminName: string): Promise<any> {
  const importDate = new Date().toISOString();
  let rowsProcessed = 0, recordsAdded = 0, recordsUpdated = 0, duplicates = 0, rejectedRows = 0;
  const seenDot = new Set<string>();
  let headers: string[] = [];

  const rl = readline.createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (headers.length === 0) {
      headers = cols.map(c => c.toLowerCase().replace(/\s+/g, '_'));
      continue;
    }
    rowsProcessed++;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
    const dot = str(row.dot_number || row.dotnumber);
    if (!dot) { rejectedRows++; continue; }
    if (seenDot.has(dot)) { duplicates++; continue; }
    seenDot.add(dot);
    if (mode === 'import') {
      const payload = buildCarrierPayload(row, fileName, importDate);
      const ex = await FmcsaCarriersModel.findOne({ dotNumber: dot });
      if (ex) {
        await FmcsaCarriersModel.updateOne({ _id: ex._id }, { $set: payload });
        recordsUpdated++;
      } else {
        await FmcsaCarriersModel.create({ _id: generatePbId(), ...payload });
        recordsAdded++;
      }
    }
  }

  const importRecord = await FmcsaImportsModel.create({
    _id: generatePbId(), fileName, fileSize, importDate, mode, rowsProcessed, recordsAdded, recordsUpdated,
    duplicates, rejectedRows, status: mode === 'validate' ? 'Validated' : 'Completed', importedByName: adminName,
    notes: mode === 'validate' ? 'Validation only' : '', sampleHeaders: headers.slice(0, 50), created: new Date(), updated: new Date(),
  });

  return { ok: true, mode, fileName, fileSize, importDate, rowsProcessed, recordsAdded, recordsUpdated, duplicates, rejectedRows, headers: headers.slice(0, 50), status: mode === 'validate' ? 'Validated' : 'Completed', importId: importRecord._id };
}
