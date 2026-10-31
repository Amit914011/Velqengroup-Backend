import { Model } from 'mongoose';
import { ASTNode, MacroContext } from './types.js';
import { resolveMacroOrContext } from './macros.js';
import { ALL_MODELS } from '../../models/index.js';

const SYSTEM_FIELDS = new Set(['id', '_id', 'created', 'updated', 'collectionId', 'collectionName']);

function isFieldAllowed(model: Model<any>, fieldPath: string): boolean {
  const root = fieldPath.split('.')[0];
  if (SYSTEM_FIELDS.has(root)) return true;
  return Boolean(model.schema.path(root));
}

function buildOpCondition(op: string, val: any): any {
  if (op === '=' || op === '==') return val;
  if (op === '!=') return { $ne: val };
  if (op === '>') return { $gt: val };
  if (op === '>=') return { $gte: val };
  if (op === '<') return { $lt: val };
  if (op === '<=') return { $lte: val };
  if (op === '~' || op === '?=') {
    const esc = String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { $regex: esc, $options: 'i' };
  }
  if (op === '!~' || op === '?!=') {
    const esc = String(val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return { $not: { $regex: esc, $options: 'i' } };
  }
  return val;
}

function resolveOperand(node: ASTNode, ctx: MacroContext): { isField: boolean; value: any } {
  if (node.type === 'IDENTIFIER') {
    const resolved = resolveMacroOrContext(node.value, ctx);
    if (resolved !== undefined) {
      return { isField: false, value: resolved };
    }
    const clean = node.value === 'id' ? '_id' : node.value;
    return { isField: true, value: clean };
  }
  if (node.type === 'LITERAL') {
    return { isField: false, value: node.value };
  }
  return { isField: false, value: null };
}

async function resolveRelation(
  model: Model<any>,
  fieldPath: string,
  op: string,
  targetVal: any
): Promise<any> {
  const [relField, targetProp] = fieldPath.split('.');
  const schemaPath = model.schema.path(relField) as any;
  const targetCol = schemaPath?.options?.ref || schemaPath?.caster?.options?.ref;
  const targetModel = targetCol ? ALL_MODELS[targetCol] : null;

  if (!targetModel) return { [fieldPath]: buildOpCondition(op, targetVal) };

  const subQ = { [targetProp === 'id' ? '_id' : targetProp]: buildOpCondition(op, targetVal) };
  const matches = await targetModel.find(subQ).select('_id').limit(500).lean();
  const matchedIds = matches.map((d: any) => String(d._id));
  return { [relField]: { $in: matchedIds } };
}

// Compile an AST node into a sanitized MongoDB query filter with field whitelisting
export async function compileASTToMongo(
  node: ASTNode,
  model: Model<any>,
  ctx: MacroContext
): Promise<any> {
  if (node.type === 'LOGICAL') {
    const leftQ = await compileASTToMongo(node.left, model, ctx);
    const rightQ = await compileASTToMongo(node.right, model, ctx);
    const op = node.op === '&&' ? '$and' : '$or';
    return { [op]: [leftQ, rightQ] };
  }

  if (node.type === 'COMPARISON') {
    const leftRes = resolveOperand(node.left, ctx);
    const rightRes = resolveOperand(node.right, ctx);

    if (!leftRes.isField && !rightRes.isField) {
      const match = leftRes.value === rightRes.value;
      const isEq = node.op === '=' || node.op === '==';
      return isEq === match ? {} : { _id: '__MATCH_NONE__' };
    }

    const fieldName = leftRes.isField ? leftRes.value : rightRes.value;
    const targetVal = leftRes.isField ? rightRes.value : leftRes.value;

    if (!isFieldAllowed(model, fieldName)) {
      throw new Error(`Field "${fieldName}" is not a valid field for this collection.`);
    }

    if (fieldName.includes('.')) {
      return resolveRelation(model, fieldName, node.op, targetVal);
    }
    return { [fieldName]: buildOpCondition(node.op, targetVal) };
  }

  if (node.type === 'IDENTIFIER') {
    const f = node.value === 'id' ? '_id' : node.value;
    if (!isFieldAllowed(model, f)) {
      throw new Error(`Field "${f}" is not a valid field for this collection.`);
    }
    return { [f]: { $nin: [null, false, ''] } };
  }

  return {};
}
