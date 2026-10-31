import { Model } from 'mongoose';
import { RuleContext, RuleAction } from './types.js';
import { loadRules } from './ruleLoader.js';
import { tokenize } from '../filter/tokenizer.js';
import { Parser } from '../filter/parser.js';
import { ASTNode } from '../filter/types.js';
import { resolveMacroOrContext } from '../filter/macros.js';
import { ALL_MODELS } from '../../models/index.js';

function getWriteRule(colName: string, action: RuleAction): string | null {
  const rules = loadRules();
  const colRule = rules[colName];
  if (!colRule) return null;
  const prop = `${action}Rule` as keyof typeof colRule;
  return colRule[prop];
}

function compareVals(op: string, a: any, b: any): boolean {
  if (op === '=' || op === '==') return String(a ?? '') === String(b ?? '');
  if (op === '!=') return String(a ?? '') !== String(b ?? '');
  if (op === '>') return Number(a) > Number(b);
  if (op === '>=') return Number(a) >= Number(b);
  if (op === '<') return Number(a) < Number(b);
  if (op === '<=') return Number(a) <= Number(b);
  if (op === '~' || op === '?=') return String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase());
  if (op === '!~' || op === '?!=') return !String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase());
  return false;
}

async function resolveRelationVal(parts: string[], recordData: any): Promise<any> {
  let curId = recordData ? recordData[parts[0]] : undefined;
  if (!curId) return null;

  let curCol = parts[0] === 'lead' ? 'leads' : 'users';
  for (let i = 1; i < parts.length; i++) {
    const prop = parts[i];
    const model = ALL_MODELS[curCol];
    if (!model) return null;
    const doc: any = await model.findById(curId).lean();
    if (!doc) return null;
    if (i === parts.length - 1) return doc[prop];
    curId = doc[prop];
    curCol = prop === 'manager' || prop === 'owner' ? 'users' : 'users';
  }
  return null;
}

async function resolveNodeVal(node: ASTNode, recordData: any, ctx: RuleContext): Promise<any> {
  if (node.type === 'LITERAL') return node.value;
  if (node.type !== 'IDENTIFIER') return null;

  const key = node.value;
  if (key.startsWith('@')) return resolveMacroOrContext(key, ctx);
  if (key.endsWith(':isset')) {
    const val = recordData ? recordData[key.replace(':isset', '')] : undefined;
    return val !== undefined && val !== null && val !== '';
  }
  if (key.endsWith(':length')) {
    const val = recordData ? recordData[key.replace(':length', '')] : undefined;
    return Array.isArray(val) ? val.length : String(val || '').length;
  }
  if (key.includes('.')) return resolveRelationVal(key.split('.'), recordData);
  if (recordData && key in recordData) return recordData[key];
  return null;
}

async function evaluateAST(node: ASTNode, recordData: any, ctx: RuleContext): Promise<boolean> {
  if (node.type === 'LOGICAL') {
    if (node.op === '&&') {
      const left = await evaluateAST(node.left, recordData, ctx);
      return left ? evaluateAST(node.right, recordData, ctx) : false;
    }
    const left = await evaluateAST(node.left, recordData, ctx);
    return left ? true : evaluateAST(node.right, recordData, ctx);
  }
  if (node.type === 'COMPARISON') {
    const left = await resolveNodeVal(node.left, recordData, ctx);
    const right = await resolveNodeVal(node.right, recordData, ctx);
    return compareVals(node.op, left, right);
  }
  if (node.type === 'LITERAL') return Boolean(node.value);
  if (node.type === 'IDENTIFIER') return Boolean(await resolveNodeVal(node, recordData, ctx));
  return false;
}

// Evaluate create, update, or delete rules against candidate record data
export async function evaluateWriteRule(
  action: 'create' | 'update' | 'delete',
  colName: string,
  _model: Model<any>,
  ctx: RuleContext
): Promise<boolean> {
  if (ctx.auth?.collectionName === '_superusers') return true;

  const rawRule = getWriteRule(colName, action);
  if (rawRule === null) return false;
  if (rawRule === '' || rawRule === '""') return true;

  try {
    const tokens = tokenize(rawRule);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const recordData = {
      ...(ctx.record || {}),
      ...(ctx.body || {}),
    };

    return await evaluateAST(ast, recordData, ctx);
  } catch (_) {
    return false;
  }
}
