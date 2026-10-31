import { MacroContext } from '../filter/types.js';

export interface RuleContext extends MacroContext {
  record?: Record<string, any>;
}

export type RuleAction = 'list' | 'view' | 'create' | 'update' | 'delete';

export interface CollectionRules {
  listRule: string | null;
  viewRule: string | null;
  createRule: string | null;
  updateRule: string | null;
  deleteRule: string | null;
}

