import { Token } from './types.js';

function readStringToken(str: string, start: number, quote: string): { token: Token; nextIdx: number } {
  let val = '';
  let i = start + 1;
  while (i < str.length) {
    if (str[i] === '\\' && i + 1 < str.length) {
      val += str[i + 1];
      i += 2;
    } else if (str[i] === quote) {
      return { token: { type: 'STRING', value: val }, nextIdx: i + 1 };
    } else {
      val += str[i];
      i++;
    }
  }
  return { token: { type: 'STRING', value: val }, nextIdx: i };
}

function readOperatorToken(str: string, start: number): { token: Token; nextIdx: number } | null {
  const three = str.substring(start, start + 3);
  if (three === '?!=') return { token: { type: 'OP', value: '?!=' }, nextIdx: start + 3 };

  const two = str.substring(start, start + 2);
  if (['!=', '>=', '<=', '!~', '?='].includes(two)) {
    return { token: { type: 'OP', value: two }, nextIdx: start + 2 };
  }

  const one = str[start];
  if (['=', '>', '<', '~'].includes(one)) {
    return { token: { type: 'OP', value: one }, nextIdx: start + 1 };
  }
  return null;
}

function readWordToken(str: string, start: number): { token: Token; nextIdx: number } {
  let val = '';
  let i = start;
  while (i < str.length && /[a-zA-Z0-9_.:@\-]/.test(str[i])) {
    val += str[i];
    i++;
  }

  const lower = val.toLowerCase();
  if (lower === 'true' || lower === 'false') {
    return { token: { type: 'BOOL', value: lower }, nextIdx: i };
  }
  if (lower === 'null') {
    return { token: { type: 'NULL', value: 'null' }, nextIdx: i };
  }
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return { token: { type: 'NUMBER', value: val }, nextIdx: i };
  }
  return { token: { type: 'IDENT', value: val }, nextIdx: i };
}

// Tokenize PocketBase filter syntax into stream of tokens
export function tokenize(filterStr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = filterStr.length;

  while (i < len) {
    const ch = filterStr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (ch === '&' && filterStr[i + 1] === '&') {
      tokens.push({ type: 'AND', value: '&&' });
      i += 2;
      continue;
    }
    if (ch === '|' && filterStr[i + 1] === '|') {
      tokens.push({ type: 'OR', value: '||' });
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const res = readStringToken(filterStr, i, ch);
      tokens.push(res.token);
      i = res.nextIdx;
      continue;
    }
    const opRes = readOperatorToken(filterStr, i);
    if (opRes) {
      tokens.push(opRes.token);
      i = opRes.nextIdx;
      continue;
    }
    const wordRes = readWordToken(filterStr, i);
    if (wordRes.nextIdx === i) {
      throw new Error(`Unexpected character '${filterStr[i]}' in filter`);
    }
    tokens.push(wordRes.token);
    i = wordRes.nextIdx;
  }
  return tokens;
}

