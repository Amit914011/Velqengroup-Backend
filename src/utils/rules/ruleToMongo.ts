import { Model } from 'mongoose';
import { RuleContext, RuleAction } from './types.js';
import { loadRules } from './ruleLoader.js';
import { evaluateStaticAuthNode } from './staticEvaluator.js';
import { tokenize } from '../filter/tokenizer.js';
import { Parser } from '../filter/parser.js';
import { compileASTToMongo } from '../filter/mongoCompiler.js';

function isSuperuser(auth: any): boolean {
  return auth?.collectionName === '_superusers';
}

function getRuleString(colName: string, action: RuleAction): string | null {
  const rules = loadRules();
  const colRule = rules[colName];
  if (!colRule) return null;
  const prop = `${action}Rule` as keyof typeof colRule;
  return colRule[prop];
}

// Compile a collection list/view access rule into a MongoDB query filter
export async function compileAccessFilter(
  action: 'list' | 'view',
  colName: string,
  model: Model<any>,
  ctx: RuleContext
): Promise<{ allowed: boolean; mongoFilter: any }> {
  if (ctx.auth?.collectionName === '_superusers') {
    return { allowed: true, mongoFilter: {} };
  }

  const rawRule = getRuleString(colName, action);

  if (rawRule === null) {
    const isSuper = isSuperuser(ctx.auth);
    return { allowed: isSuper, mongoFilter: {} };
  }

  if (rawRule === '' || rawRule === '""') {
    return { allowed: true, mongoFilter: {} };
  }

  try {
    const tokens = tokenize(rawRule);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const staticRes = evaluateStaticAuthNode(ast, ctx);
    if (staticRes.isStatic) {
      if (!staticRes.value) {
        return { allowed: true, mongoFilter: { _id: '__MATCH_NONE__' } };
      }
      return { allowed: true, mongoFilter: {} };
    }

    const compiledFilter = await compileASTToMongo(ast, model, ctx);
    return { allowed: true, mongoFilter: compiledFilter };
  } catch (_) {
    return { allowed: true, mongoFilter: { _id: '__MATCH_NONE__' } };
  }
}
