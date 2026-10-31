import { MacroContext } from './types.js';

function getMacroDate(ident: string): Date | null {
  const now = new Date();
  if (ident === '@now') return now;
  if (ident === '@todayStart') return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  if (ident === '@todayEnd') return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (ident === '@monthStart') return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  if (ident === '@monthEnd') return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  if (ident === '@yearStart') return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  if (ident === '@yearEnd') return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return null;
}

// Resolve macros and request context paths
export function resolveMacroOrContext(ident: string, ctx: MacroContext): any {
  const d = getMacroDate(ident);
  if (d) return d;

  if (ident.startsWith('@request.auth.')) {
    const key = ident.replace('@request.auth.', '');
    if (!ctx.auth) return '';
    return ctx.auth[key] ?? '';
  }

  if (ident === '@request.auth') {
    return ctx.auth ? ctx.auth.id : '';
  }

  if (ident.startsWith('@request.body.')) {
    const key = ident.replace('@request.body.', '');
    return ctx.body ? ctx.body[key] : undefined;
  }

  if (ident.startsWith('@request.query.')) {
    const key = ident.replace('@request.query.', '');
    return ctx.query ? ctx.query[key] : undefined;
  }

  if (ident === '@request.method') {
    return ctx.method || 'GET';
  }

  return undefined;
}

