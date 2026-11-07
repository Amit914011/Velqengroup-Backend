const CARGO_MAP: Record<string, string> = {
  crgo_genfreight: 'General Freight',
  crgo_household: 'Household Goods',
  crgo_metalsheet: 'Metal / Sheets / Coils / Rolls',
  crgo_motoveh: 'Motor Vehicles',
  crgo_drivetow: 'Drive/Tow Away',
  crgo_logpole: 'Logs / Poles / Beams / Lumber',
  crgo_bldgmat: 'Building Materials',
  crgo_machlrg: 'Machinery / Large Objects',
  crgo_produce: 'Fresh Produce',
  crgo_liqgas: 'Liquids / Gases',
  crgo_intermodal: 'Intermodal Containers',
  crgo_passengers: 'Passengers',
  crgo_livestock: 'Livestock',
  crgo_grainfeed: 'Grain / Feed / Hay',
  crgo_coalcoke: 'Coal / Coke',
  crgo_meat: 'Meat',
  crgo_garbage: 'Garbage / Refuse',
  crgo_usmail: 'U.S. Mail',
  crgo_chem: 'Chemicals',
  crgo_drybulk: 'Dry Bulk Commodities',
  crgo_coldfood: 'Refrigerated Food',
  crgo_beverages: 'Beverages',
  crgo_paperprod: 'Paper Products',
  crgo_utility: 'Utility',
  crgo_farmsupp: 'Farm Supplies',
  crgo_construct: 'Construction',
  crgo_waterwell: 'Water Well',
  crgo_cargoothr: 'Other Cargo',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function str(v: any): string {
  return v === undefined || v === null ? '' : String(v).trim();
}

export function num(v: any): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

export function mapStatus(code: any): { label: string; raw: string; mapped: boolean } {
  const c = str(code).toUpperCase();
  if (c === 'A') return { label: 'ACTIVE', raw: c, mapped: true };
  if (c === 'I') return { label: 'INACTIVE', raw: c, mapped: true };
  if (c === 'P') return { label: 'PENDING', raw: c, mapped: true };
  if (!c) return { label: 'UNKNOWN', raw: '', mapped: false };
  return { label: c, raw: c, mapped: false };
}

export function formatFmcsaDate(raw: any): { display: string; raw: string } {
  const s = str(raw);
  if (!s || s === '00000000' || !/^\d{8}/.test(s)) return { display: '', raw: s };
  const y = s.slice(0, 4);
  const m = parseInt(s.slice(4, 6), 10);
  const d = parseInt(s.slice(6, 8), 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return { display: '', raw: s };
  return { display: `${MONTHS[m - 1]} ${d}, ${y}`, raw: s };
}

export function buildCargoCategories(row: Record<string, any>): { categories: string[]; otherDesc: string } {
  const list: string[] = [];
  for (const [field, label] of Object.entries(CARGO_MAP)) {
    const s = str(row[field]).toUpperCase();
    if (s === 'X' || s === 'Y' || s === 'YES' || s === 'T' || s === '1' || s === 'TRUE') {
      list.push(label);
    }
  }
  return { categories: list, otherDesc: str(row.crgo_cargoothr_desc) };
}

export function buildDockets(rec: any): any[] {
  const out: any[] = [];
  for (const i of [1, 2, 3]) {
    const prefix = str(rec[`docket${i}Prefix`]);
    const number = str(rec[`docket${i}`]);
    if (prefix && number) {
      out.push({
        prefix,
        number,
        display: `${prefix}-${number}`,
        status: mapStatus(rec[`docket${i}Status`]),
      });
    }
  }
  return out;
}

export function computeFlags(rec: any, dotStatus: any, dockets: any[]): any[] {
  const flags: any[] = [];
  if (dotStatus.label === 'INACTIVE') flags.push({ flag: 'USDOT Inactive', detail: 'USDOT registration status is INACTIVE.' });
  if (dotStatus.label === 'PENDING') flags.push({ flag: 'USDOT Pending', detail: 'USDOT registration status is PENDING — review required.' });
  if (!dotStatus.mapped && dotStatus.raw) flags.push({ flag: 'Unmapped USDOT Status', detail: `Raw status code "${dotStatus.raw}".` });

  for (const d of dockets) {
    if (d.status.label === 'INACTIVE') flags.push({ flag: `${d.display} Inactive`, detail: `Docket ${d.display} authority is INACTIVE.` });
    if (d.status.label === 'PENDING') flags.push({ flag: `${d.display} Pending`, detail: `Docket ${d.display} authority is PENDING.` });
    if (!d.status.mapped && d.status.raw) flags.push({ flag: `${d.display} Unmapped Status`, detail: `Raw code "${d.status.raw}".` });
  }

  const sr = str(rec.safetyRating).toUpperCase();
  if (sr === 'U') flags.push({ flag: 'Unsatisfactory Safety Rating', detail: 'FMCSA safety rating: Unsatisfactory.' });
  if (sr === 'C') flags.push({ flag: 'Conditional Safety Rating', detail: 'FMCSA safety rating: Conditional.' });

  if (str(rec.hmInd).toUpperCase() === 'Y') flags.push({ flag: 'Hazmat Authorized', detail: 'Carrier authorized for hazardous materials.' });
  if (str(rec.priorRevokeFlag).toUpperCase() === 'Y') flags.push({ flag: 'Prior Revocation', detail: `Prior revocation on record (USDOT ${str(rec.priorRevokeDotNumber) || '—'}).` });
  return flags;
}

export function computeDecision(flags: any[], dotStatus: any, dockets: any[]): { level: string; decision: string } {
  const hardRed = flags.some((f) => f.flag === 'USDOT Inactive' || f.flag === 'Unsatisfactory Safety Rating' || f.flag === 'Prior Revocation');
  if (hardRed) return { level: 'RED', decision: 'HIGH CONCERN' };
  if (flags.length > 0) return { level: 'AMBER', decision: 'REVIEW REQUIRED' };
  const hasActiveDocket = dockets.some((d) => d.status.label === 'ACTIVE');
  if (dotStatus.label === 'ACTIVE' && hasActiveDocket) return { level: 'GREEN', decision: 'LOWER CONCERN' };
  return { level: 'AMBER', decision: 'REVIEW REQUIRED' };
}

export function normalizeCarrier(rec: any, datasetImportDate: string, query: string): Record<string, any> {
  const dotStatus = mapStatus(rec.statusCode);
  const dockets = buildDockets(rec);
  const primaryDocket = dockets[0] || null;
  const cargo = Array.isArray(rec.cargoCategories) ? rec.cargoCategories : [];
  const mcs150 = formatFmcsaDate(rec.mcs150Date);
  const flags = computeFlags(rec, dotStatus, dockets);
  const { level, decision } = computeDecision(flags, dotStatus, dockets);

  return {
    found: true,
    source: 'imported-dataset',
    provider: 'Imported FMCSA Dataset',
    datasetImportDate: datasetImportDate || rec.sourceImportDate || '',
    query,
    legalName: str(rec.legalName),
    dbaName: str(rec.dbaName),
    usdotNumber: str(rec.dotNumber),
    dotStatus,
    primaryDocket,
    dockets,
    company: {
      businessOrgDesc: str(rec.businessOrgDesc),
      carrierOperation: str(rec.carrierOperation),
      classdef: str(rec.classdef),
      companyOfficer1: str(rec.companyOfficer1),
      companyOfficer2: str(rec.companyOfficer2),
    },
    address: {
      phyStreet: str(rec.phyStreet), phyCity: str(rec.phyCity), phyState: str(rec.phyState), phyZip: str(rec.phyZip), phyCountry: str(rec.phyCountry),
      mailStreet: str(rec.mailStreet), mailCity: str(rec.mailCity), mailState: str(rec.mailState), mailZip: str(rec.mailZip), mailCountry: str(rec.mailCountry),
    },
    contact: { phone: str(rec.phone), cellPhone: str(rec.cellPhone), email: str(rec.email) },
    fleet: {
      truckUnits: num(rec.truckUnits), powerUnits: num(rec.powerUnits), busUnits: num(rec.busUnits),
      fleetSize: num(rec.fleetSize), totalDrivers: num(rec.totalDrivers), totalCdl: num(rec.totalCdl),
      driverInterTotal: num(rec.driverInterTotal), totalIntrastateDrivers: num(rec.totalIntrastateDrivers),
    },
    mcs150: { date: mcs150.display, dateRaw: mcs150.raw, mileage: num(rec.mcs150Mileage), mileageYear: str(rec.mcs150MileageYear) },
    safety: {
      safetyRating: str(rec.safetyRating), safetyRatingDate: formatFmcsaDate(rec.safetyRatingDate).display,
      reviewType: str(rec.reviewType), reviewDate: formatFmcsaDate(rec.reviewDate).display,
      hmInd: str(rec.hmInd), priorRevokeFlag: str(rec.priorRevokeFlag), priorRevokeDotNumber: str(rec.priorRevokeDotNumber),
    },
    cargo: { categories: cargo, otherDesc: str(rec.cargoOtherDesc) },
    level, decision, flags,
    officialUrl: rec.dotNumber ? `https://safer.fmcsa.dot.gov/CompanySnapshot.aspx?dotNumber=${encodeURIComponent(rec.dotNumber)}` : '',
    sourceTimestamp: new Date().toISOString(),
  };
}

export function matchSummary(rec: any): Record<string, any> {
  const dockets = buildDockets(rec);
  const mc = dockets.find((d) => d.prefix === 'MC') || dockets[0] || null;
  return {
    usdotNumber: str(rec.dotNumber), legalName: str(rec.legalName), dbaName: str(rec.dbaName),
    mcNumber: mc?.display || '', phyCity: str(rec.phyCity), phyState: str(rec.phyState),
    dotStatus: mapStatus(rec.statusCode), primaryDocketStatus: mc?.status || null, recordId: rec._id || rec.id,
  };
}

export function notFound(query: string): Record<string, any> {
  return { found: false, query, provider: 'Imported FMCSA Dataset', message: 'No matching carrier found in the current FMCSA dataset.' };
}

