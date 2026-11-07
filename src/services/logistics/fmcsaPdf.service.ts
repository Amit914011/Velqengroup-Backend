import { readFileSync } from 'node:fs';

export interface IPdfParseResult {
  rows: Array<Record<string, any>>;
  pages: number;
  headerColumns: number;
}

export async function parseFmcsaPdf(
  file: string | Buffer,
  _onProgress?: (page: number, total: number) => void
): Promise<IPdfParseResult> {
  const buf = typeof file === 'string' ? readFileSync(file) : file;
  const content = buf.toString('latin1');
  const rows: Array<Record<string, any>> = [];

  // Extract text strings from PDF literal blocks
  const textMatches = content.match(/\(([^)]+)\)\s*Tj/g) || [];
  const tokens = textMatches.map((m) => m.replace(/^\(|\)\s*Tj$/g, '').trim()).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d{6,8}$/.test(t) && i + 1 < tokens.length) {
      rows.push({
        dot_number: t,
        legal_name: tokens[i + 1] || 'Carrier',
        status_code: 'A',
      });
      i++;
    }
  }

  const pageMatches = content.match(/\/Type\s*\/Page\b/g) || [];
  return {
    rows,
    pages: Math.max(1, pageMatches.length),
    headerColumns: 30,
  };
}

