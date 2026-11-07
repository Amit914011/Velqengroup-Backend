import { broadcastRecordChange } from '../utils/realtimeHub.js';

export type HookEvent =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete';

export interface HookContext {
  collection: string;
  body: Record<string, any>;
  auth?: any;
  id?: string;
  record?: any;
}

export interface AfterHookContext {
  collection: string;
  record: any;
  auth?: any;
  body?: Record<string, any>;
}

export type BeforeHookFn = (ctx: HookContext) => Promise<Record<string, any> | void> | Record<string, any> | void;
export type AfterHookFn = (ctx: AfterHookContext) => Promise<void> | void;

export class HookDispatcherError extends Error {
  code: number;
  data: any;
  constructor(code: number, message: string, data: any = {}) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

const registry = new Map<string, Array<BeforeHookFn | AfterHookFn>>();

function getRegistryKey(collection: string, event: HookEvent): string {
  return `${collection}:${event}`;
}

export function registerHook(collection: string, event: HookEvent, fn: BeforeHookFn | AfterHookFn): void {
  const key = getRegistryKey(collection, event);
  const existing = registry.get(key) || [];
  existing.push(fn);
  registry.set(key, existing);
}

// Clear hooks (primarily for test resets)
export function clearHooks(collection?: string): void {
  if (collection) {
    for (const key of registry.keys()) {
      if (key.startsWith(`${collection}:`)) registry.delete(key);
    }
  } else {
    registry.clear();
  }
}

// Run before-write hooks in sequence; can mutate or return new body, or throw to reject
export async function dispatchBefore(
  event: 'beforeCreate' | 'beforeUpdate' | 'beforeDelete',
  ctx: HookContext
): Promise<Record<string, any>> {
  const key = getRegistryKey(ctx.collection, event);
  const wildcardKey = getRegistryKey('*', event);
  const hooks = [...(registry.get(wildcardKey) || []), ...(registry.get(key) || [])] as BeforeHookFn[];

  let currentBody = { ...(ctx.body || {}) };
  for (const hook of hooks) {
    const res = await hook({ ...ctx, body: currentBody });
    if (res && typeof res === 'object') {
      currentBody = { ...currentBody, ...res };
    }
  }
  return currentBody;
}

// Run after-write hooks and broadcast realtime change
export async function dispatchAfter(
  event: 'afterCreate' | 'afterUpdate' | 'afterDelete',
  ctx: AfterHookContext
): Promise<void> {
  const actionMap: Record<string, 'create' | 'update' | 'delete'> = {
    afterCreate: 'create',
    afterUpdate: 'update',
    afterDelete: 'delete',
  };
  const action = actionMap[event];
  if (action && ctx.record) {
    broadcastRecordChange(action, ctx.collection, ctx.record).catch(() => {});
  }

  const key = getRegistryKey(ctx.collection, event);
  const wildcardKey = getRegistryKey('*', event);
  const hooks = [...(registry.get(wildcardKey) || []), ...(registry.get(key) || [])] as AfterHookFn[];

  for (const hook of hooks) {
    try {
      await hook(ctx);
    } catch (err: any) {
      process.stderr.write(`[Hook Warning] ${ctx.collection}:${event} error: ${err.message || 'unknown'}\n`);
    }
  }
}

