import { ASTNode } from '../filter/types.js';
import { resolveMacroOrContext } from '../filter/macros.js';
import { RuleContext } from './types.js';

function evalLogicalStatic(
  node: { op: '&&' | '||'; left: ASTNode; right: ASTNode },
  ctx: RuleContext
): { isStatic: boolean; value?: boolean } {
  const leftRes = evaluateStaticAuthNode(node.left, ctx);
  const rightRes = evaluateStaticAuthNode(node.right, ctx);

  if (node.op === '&&') {
    if ((leftRes.isStatic && leftRes.value === false) || (rightRes.isStatic && rightRes.value === false)) {
      return { isStatic: true, value: false };
    }
    if (leftRes.isStatic && rightRes.isStatic) {
      return { isStatic: true, value: Boolean(leftRes.value && rightRes.value) };
    }
  }

  if (node.op === '||') {
    if ((leftRes.isStatic && leftRes.value === true) || (rightRes.isStatic && rightRes.value === true)) {
      return { isStatic: true, value: true };
    }
    if (leftRes.isStatic && rightRes.isStatic) {
      return { isStatic: true, value: Boolean(leftRes.value || rightRes.value) };
    }
  }

  return { isStatic: false };
}

function resolveStaticSide(node: ASTNode, ctx: RuleContext): { isStatic: boolean; val: any } {
  if (node.type === 'LITERAL') return { isStatic: true, val: node.value };
  if (node.type === 'IDENTIFIER') {
    if (node.value.startsWith('@request.') || node.value.startsWith('@now') || node.value.startsWith('@today')) {
      return { isStatic: true, val: resolveMacroOrContext(node.value, ctx) };
    }
  }
  return { isStatic: false, val: undefined };
}

function compareValues(op: string, a: any, b: any): boolean {
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

// Evaluate static request/auth AST expressions in memory
export function evaluateStaticAuthNode(
  node: ASTNode,
  ctx: RuleContext
): { isStatic: boolean; value?: boolean } {
  if (node.type === 'LOGICAL') {
    return evalLogicalStatic(node, ctx);
  }

  if (node.type === 'COMPARISON') {
    const left = resolveStaticSide(node.left, ctx);
    const right = resolveStaticSide(node.right, ctx);
    if (left.isStatic && right.isStatic) {
      return { isStatic: true, value: compareValues(node.op, left.val, right.val) };
    }
    return { isStatic: false };
  }

  if (node.type === 'LITERAL') {
    return { isStatic: true, value: Boolean(node.value) };
  }

  return { isStatic: false };
}
