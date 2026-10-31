import { compileAccessFilter } from './ruleToMongo.js';
import { evaluateWriteRule } from './writeChecker.js';
import { loadRules } from './ruleLoader.js';

export * from './types.js';
export * from './ruleLoader.js';
export * from './staticEvaluator.js';
export * from './ruleToMongo.js';
export * from './writeChecker.js';

export const RuleEngine = {
  loadRules,
  compileAccessFilter,
  evaluateWriteRule,
};

