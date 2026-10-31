import { Model } from 'mongoose';
import { MacroContext } from './types.js';
import { tokenize } from './tokenizer.js';
import { Parser } from './parser.js';
import { compileASTToMongo } from './mongoCompiler.js';

export * from './types.js';
export * from './tokenizer.js';
export * from './parser.js';
export * from './macros.js';
export * from './mongoCompiler.js';

// Parse a filter string and compile it to a MongoDB query filter object
export async function parseFilter(
  filterStr: string,
  model: Model<any>,
  ctx: MacroContext
): Promise<any> {
  if (!filterStr || !filterStr.trim()) return {};
  const tokens = tokenize(filterStr.trim());
  const parser = new Parser(tokens);
  const ast = parser.parse();
  return compileASTToMongo(ast, model, ctx);
}

