import { Response } from 'express';
import crypto from 'node:crypto';
import { RuleEngine } from './rules/index.js';
import { ALL_MODELS } from '../models/index.js';
import { formatRecord } from '../views/record.view.js';

interface ConnectedClient {
  id: string;
  res: Response;
  auth: any;
  subscriptions: Set<string>;
  lastActive: number;
}

const clients = new Map<string, ConnectedClient>();

// Generate unique 36-character client id
export function generateRealtimeClientId(): string {
  return crypto.randomBytes(20).toString('hex');
}

// Register a new SSE connection
export function registerClient(id: string, res: Response, auth: any): void {
  clients.set(id, {
    id,
    res,
    auth,
    subscriptions: new Set(),
    lastActive: Date.now(),
  });
}

// Remove closed connection
export function unregisterClient(id: string): void {
  clients.delete(id);
}

// Update client subscriptions and auth context
export function updateClientSubscriptions(id: string, subs: string[], auth?: any): boolean {
  const client = clients.get(id);
  if (!client) return false;
  client.subscriptions = new Set(subs);
  if (auth) client.auth = auth;
  client.lastActive = Date.now();
  return true;
}

// Check if a client's subscription matches a record change
function getMatchingTopics(subs: Set<string>, col: string, recId: string): string[] {
  const matched: string[] = [];
  for (const raw of subs) {
    const topic = raw.split('?')[0]; // Strip options if present
    if (topic === '*' || topic === col || topic === `${col}/*` || topic === `${col}/${recId}`) {
      matched.push(raw);
    }
  }
  return matched;
}

// Verify client has read access to the record under list/view rules
async function canClientRead(client: ConnectedClient, col: string, doc: any): Promise<boolean> {
  const model = ALL_MODELS[col];
  if (!model) return false;
  const ruleCtx = { auth: client.auth, query: {}, method: 'GET' };
  const { allowed, mongoFilter } = await RuleEngine.compileAccessFilter('view', col, model, ruleCtx);
  if (!allowed) return false;
  if (!mongoFilter || Object.keys(mongoFilter).length === 0) return true;
  return Boolean(await model.exists({ _id: doc._id || doc.id, ...mongoFilter }));
}

// Broadcast record event to all subscribed clients
export async function broadcastRecordChange(action: 'create' | 'update' | 'delete', col: string, doc: any): Promise<void> {
  const recId = String(doc._id || doc.id || '');
  for (const client of clients.values()) {
    const matchedTopics = getMatchingTopics(client.subscriptions, col, recId);
    if (matchedTopics.length === 0) continue;

    try {
      if (action !== 'delete' && !(await canClientRead(client, col, doc))) continue;
      const formatted = formatRecord(doc, col, undefined, client.auth);
      const payload = JSON.stringify({ action, record: formatted });
      for (const topic of matchedTopics) {
        client.res.write(`event:${topic}\ndata:${payload}\n\n`);
      }
    } catch (_) {}
  }
}

// Periodic heartbeat to prevent idle connection termination
setInterval(() => {
  for (const client of clients.values()) {
    try {
      client.res.write(`data:{"clientId":"${client.id}"}\n\n`);
    } catch (_) {
      clients.delete(client.id);
    }
  }
}, 30000).unref();

